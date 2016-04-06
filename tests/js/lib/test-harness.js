// The common test harness we will use for all tests as well as manual verification.
"use strict";
var fluid = require("infusion");

require("../../../index");


require("gpii-express");
require("gpii-handlebars");
require("gpii-mail-test");

require("./test-harness-pouch");


fluid.defaults("gpii.express.user.tests.harness.gated.handler", {
    gradeNames: ["gpii.express.handler"],
    invokers: {
        handleRequest: {
            funcName: "gpii.express.handler.sendResponse",
            args: ["{that}", "{that}.response", 200, { ok: true, message: "You are in the club!"}]
        }
    }
});

// TODO:  Update this to use the new version of gpii-mail-test once we have a Zombie version that works in 0.12 or higher.
fluid.defaults("gpii.express.user.tests.harness", {
    gradeNames: ["fluid.component"],
    pouchPort:  "9735",
    apiPort:    "5379",
    mailPort:   "5225",
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/", { port: "{that}.options.apiPort"}]
        }
    },
    // As we may commonly be working with a debugger, we need a much longer timeout for all `requestAwareRouter` and `contentAware` grades.
    timeout: 99999999,
    templateDirs: ["%gpii-express-user/src/templates", "%gpii-json-schema/src/templates"],
    distributeOptions: [
        {
            source: "{that}.options.timeout",
            target: "{that gpii.express.requestAware.router}.options.timeout"
        },
        {
            source: "{that}.options.timeout",
            target: "{that gpii.express.contentAware.router}.options.timeout"
        },
        // Make sure any mailer components are aware of our outgoing mail port
        {
            source: "{that}.options.mailPort",
            target: "{that gpii.express.user.mailer}.options.transportOptions.port"
        }
    ],
    events: {
        onApiDone:             null,
        onApiReady:            null,
        onApiStarted:          null,
        onMailDone:            null,
        onMailReady:           null,
        onPouchDone:           null,
        onPouchStarted:        null,
        onPouchExpressStarted: null, // TODO:  Remove?
        onStarted: {
            events: {
                onPouchStarted: "onPouchStarted",
                onApiStarted:   "onApiStarted",
                onApiReady:     "onApiReady",
                onMailReady:    "onMailReady"
            }
        },
        onDone: {
            events: {
                onPouchDone: "onPouchDone",
                onApiDone:   "onApiDone",
                onMailDone:  "onMailDone"
            }
        }
    },
    components: {
        api: {
            type: "gpii.express",
            options: {
                gradeNames: ["gpii.express.user.api.withRequiredMiddleware"],
                port:  "{harness}.options.apiPort",
                listeners: {
                    "onStarted.notifyParent": "{harness}.events.onApiStarted.fire",
                    "afterDestroy.notifyParent": "{harness}.events.onApiDone.fire"
                },
                components: {
                    // Front-end content used by some GET calls
                    modules: {
                        type:  "gpii.express.router.static",
                        options: {
                            priority: "after:session",
                            path:    "/modules",
                            content: "%gpii-express-user/node_modules"
                        }
                    },
                    bc: {
                        type:  "gpii.express.router.static",
                        options: {
                            priority: "after:session",
                            path:    "/bc",
                            content: "%gpii-express-user/bower_components"
                        }
                    },
                    inline: {
                        type: "gpii.express.hb.inline",
                        options: {
                            priority: "after:session",
                            path: "/hbs",
                            templateDirs: "{gpii.express.user.tests.harness}.options.templateDirs"
                        }
                    },
                    schemas: {
                        type: "gpii.express.router.static",
                        options: {
                            priority: "after:session",
                            path:    "/schemas",
                            content: "%gpii-express-user/src/schemas"
                        }
                    },
                    inlineSchemas: {
                        type: "gpii.schema.inline.router",
                        options: {
                            priority: "after:session",
                            schemaDirs: "%gpii-express-user/src/schemas"
                        }
                    },
                    api: {
                        type: "gpii.express.user.api",
                        options: {
                            path:     "/api/user",
                            priority: "after:session",
                            couch:  {
                                port: "{harness}.options.pouchPort",
                                userDbName: "users",
                                userDbUrl: {
                                    expander: {
                                        funcName: "fluid.stringTemplate",
                                        args:     ["http://localhost:%port/%userDbName", "{that}.options.couch"]
                                    }
                                }
                            },
                            listeners: {
                                "onReady.notifyHarness": {
                                    func: "{harness}.events.onApiReady.fire"

                                }
                            },
                            app: {
                                name: "gpii-express-user API test harness...",
                                url:  "{harness}.options.baseUrl"
                            }
                        }
                    },
                    // A "gated" endpoint that can only be accessed if the user is logged in
                    gated: {
                        type: "gpii.express.user.middleware.loginRequired.router",
                        options: {
                            path: "/gated",
                            priority: "after:session",
                            handlerGrades: ["gpii.express.user.tests.harness.gated.handler"]
                        }
                    },
                    // Serve up the rest of our static content (JS source, etc.)
                    src: {
                        type:  "gpii.express.router.static",
                        options: {
                            path:     "/",
                            priority: "last",
                            content:  "%gpii-express-user/src"
                        }
                    }
                }
            }
        },
        pouch: {
            type: "gpii.express.user.tests.pouch",
            options: {
                port: "{harness}.options.pouchPort",
                listeners: {
                    onAllStarted: "{harness}.events.onPouchStarted.fire",
                    "afterDestroy.notifyParent": "{harness}.events.onPouchDone.fire"
                }
            }
        },
        smtp: {
            type: "gpii.test.mail.smtp",
            options: {
                port: "{harness}.options.mailPort",
                listeners: {
                    "onReady": [
                        { funcName: "fluid.log", args: ["mail server started and notifying parent..."]},
                        {
                            func: "{harness}.events.onMailReady.fire"
                        }
                    ],
                    "afterDestroy.notifyParent": "{harness}.events.onMailDone.fire"
                }
            }
        }
    }
});