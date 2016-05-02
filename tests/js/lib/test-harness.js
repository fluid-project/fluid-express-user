// The common test harness we will use for all tests as well as manual verification.
"use strict";
var fluid = require("infusion");

require("../../../");


require("gpii-express");
require("gpii-handlebars");
require("gpii-mail-test");

require("./test-harness-pouch");


fluid.defaults("gpii.test.express.user.harness.gated.handler", {
    gradeNames: ["gpii.express.handler"],
    invokers: {
        handleRequest: {
            funcName: "gpii.express.handler.sendResponse",
            args: ["{that}", "{that}.options.response", 200, { ok: true, message: "You are in the club!"}]
        }
    }
});


fluid.defaults("gpii.test.express.user.harness", {
    gradeNames: ["fluid.component"],
    pouchPort:  "9735",
    apiPort:    "5379",
    mailPort:   "5225",
    templateDirs: ["%gpii-express-user/src/templates", "%gpii-json-schema/src/templates"],
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/", { port: "{that}.options.apiPort"}]
        }
    },
    // As we may commonly be working with a debugger, we need a much longer timeout for all `requestAwareRouter` and `contentAware` grades.
    timeout: 99999999,
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
                gradeNames: ["gpii.express.user.withRequiredMiddleware"],
                port:  "{harness}.options.apiPort",
                templateDirs: "{gpii.test.express.user.harness}.options.templateDirs",
                listeners: {
                    "onStarted.notifyParent": "{harness}.events.onApiStarted.fire",
                    "afterDestroy.notifyParent": "{harness}.events.onApiDone.fire"
                },
                distributeOptions: {
                    record: 1000000,
                    target: "{that gpii.express.handlerDispatcher}.options.timeout"
                },
                components: {
                    // Front-end content used by some GET calls
                    modules: {
                        type:  "gpii.express.router.static",
                        options: {
                            namespace: "modules",
                            priority:  "after:session",
                            path:      "/modules",
                            content:   "%gpii-express-user/node_modules"
                        }
                    },
                    bc: {
                        type:  "gpii.express.router.static",
                        options: {
                            namespace: "bc",
                            priority:  "after:modules",
                            path:      "/bc",
                            content:   "%gpii-express-user/bower_components"
                        }
                    },
                    inline: {
                        type: "gpii.handlebars.inlineTemplateBundlingMiddleware",
                        options: {
                            namespace:    "inline",
                            priority:     "after:bc",
                            path:         "/hbs",
                            templateDirs: "{gpii.test.express.user.harness}.options.templateDirs"
                        }
                    },
                    schemas: {
                        type: "gpii.express.router.static",
                        options: {
                            namespace: "schemas",
                            priority:  "after:inline",
                            path:      "/schemas",
                            content:   "%gpii-express-user/src/schemas"
                        }
                    },
                    inlineSchemas: {
                        type: "gpii.schema.inlineMiddleware",
                        options: {
                            namespace:  "inlineSchemas",
                            priority:   "after:schemas",
                            schemaDirs: "%gpii-express-user/src/schemas"
                        }
                    },
                    api: {
                        type: "gpii.express.user.api",
                        options: {
                            path:      "/api/user",
                            namespace: "api",
                            priority:  "after:inlineSchemas",
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
                                name: "gpii-express.user test harness...",
                                url:  "{harness}.options.baseUrl"
                            }
                        }
                    },
                    // A "gated" endpoint that can only be accessed if the user is logged in
                    gated: {
                        type: "gpii.express.user.middleware.loginRequired.router",
                        options: {
                            namespace:     "gated",
                            path:          "/gated",
                            priority:      "after:api",
                            handlerGrades: ["gpii.test.express.user.harness.gated.handler"]
                        }
                    },
                    // Serve up the rest of our static content (JS source, etc.)
                    src: {
                        type:  "gpii.express.router.static",
                        options: {
                            namespace: "src",
                            path:      "/",
                            priority:  "after:gated",
                            content:   "%gpii-express-user/src"
                        }
                    },
                    errorHeaders: {
                        type: "gpii.schema.schemaLinkMiddleware",
                        options: {
                            priority:  "after:src",
                            schemaKey: "message.json",
                            schemaUrl: "http://ul.gpii.net/api/schemas/message.json"
                        }
                    },
                    jsonErrors: {
                        type: "gpii.express.middleware.error",
                        options: {
                            priority: "after:schemaLinkMiddleware"
                        }
                    }
                }
            }
        },
        pouch: {
            type: "gpii.test.express.user.pouch",
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