// The common test harness we will use for all tests as well as manual verification.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../../../");

require("gpii-express");
require("gpii-handlebars");
require("gpii-mail-test");

require("./test-harness-couch");


fluid.defaults("gpii.test.express.user.harness.gated.handler", {
    gradeNames: ["gpii.express.handler"],
    invokers: {
        handleRequest: {
            funcName: "gpii.express.handler.sendResponse",
            args: ["{that}", "{that}.options.response", 200, { ok: true, message: "You are in the club!"}]
        }
    }
});

fluid.defaults("gpii.test.express.user.harness.express", {
    gradeNames: ["gpii.express", "gpii.express.user.withRequiredMiddleware"],
    distributeOptions: {
        record: 1000000,
        target: "{that gpii.express.handlerDispatcher}.options.timeout"
    },
    messageDirs: {
        validation: "%gpii-json-schema/src/messages",
        user: "%gpii-express-user/src/messages"
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
        inline: {
            type: "gpii.handlebars.inlineTemplateBundlingMiddleware",
            options: {
                namespace:    "inline",
                priority:     "after:modules",
                path:         "/templates"
            }
        },
        messageLoader: {
            type: "gpii.handlebars.i18n.messageLoader",
            options: {
                messageDirs: "{gpii.test.express.user.harness.express}.options.messageDirs"
            }
        },
        messages: {
            type: "gpii.handlebars.inlineMessageBundlingMiddleware",
            options: {
                messageDirs: "{gpii.test.express.user.harness.express}.options.messageDirs",
                model: {
                    messageBundles: "{messageLoader}.model.messageBundles"
                }
            }
        },
        api: {
            type: "gpii.express.user.api",
            options: {
                path:      "/api/user",
                namespace: "api",
                priority:  "after:inline",
                couch:  {
                    port: 25984
                },
                app: {
                    name: "gpii-express.user test harness..."
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
        jsonErrors: {
            type: "gpii.express.middleware.error",
            options: {
                defaultStatusCode: 400, // TODO: discuss handling this in gpii-json-schema
                priority: "after:src"
            }
        }
    }
});

fluid.defaults("gpii.test.express.user.harness", {
    gradeNames: ["fluid.component"],
    port:       "5379",
    couchPort:  "25984",
    mailPort:   "5225",
    templateDirs: ["%gpii-express-user/src/templates", "%gpii-json-schema/src/templates"],
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/", { port: "{that}.options.port"}]
        }
    },
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
    components: {
        express: {
            type: "gpii.test.express.user.harness.express",
            options: {
                port:  "{harness}.options.port",
                templateDirs: "{harness}.options.templateDirs",
                components: {
                    inline: {
                        options: {
                            templateDirs: "{harness}.options.templateDirs"
                        }
                    },
                    api: {
                        options: {
                            couch:  {
                                port: "{harness}.options.couchPort"
                            },
                            app: {
                                url:  "{harness}.options.baseUrl"
                            }
                        }
                    }
                }
            }
        },
        couch: {
            type: "gpii.test.express.user.couch",
            options: {
                couch: {
                    port: "{harness}.options.couchPort"
                }
            }
        },
        smtp: {
            type: "gpii.test.mail.smtp",
            options: {
                port: "{harness}.options.mailPort"
            }
        }
    }
});
