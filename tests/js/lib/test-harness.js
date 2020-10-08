// The common test harness we will use for all tests as well as manual verification.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../../../");

require("fluid-express");
require("fluid-handlebars");
require("fluid-mail-test");

require("./test-harness-couch");


fluid.defaults("fluid.test.express.user.harness.gated.handler", {
    gradeNames: ["fluid.express.handler"],
    invokers: {
        handleRequest: {
            funcName: "fluid.express.handler.sendResponse",
            args: ["{that}", "{that}.options.response", 200, { ok: true, message: "You are in the club!"}]
        }
    }
});

fluid.defaults("fluid.test.express.user.harness.express", {
    gradeNames: ["fluid.express", "fluid.express.user.withRequiredMiddleware"],
    distributeOptions: {
        record: 1000000,
        target: "{that fluid.express.handlerDispatcher}.options.timeout"
    },
    messageDirs: {
        validation: "%fluid-json-schema/src/messages",
        user: "%fluid-express-user/src/messages"
    },
    components: {
        // Front-end content used by some GET calls
        modules: {
            type:  "fluid.express.router.static",
            options: {
                namespace: "modules",
                priority:  "after:session",
                path:      "/modules",
                content:   "%fluid-express-user/node_modules"
            }
        },
        inline: {
            type: "fluid.handlebars.inlineTemplateBundlingMiddleware",
            options: {
                namespace:    "inline",
                priority:     "after:modules",
                path:         "/templates"
            }
        },
        messageBundleLoader: {
            type: "fluid.handlebars.i18n.messageBundleLoader",
            options: {
                messageDirs: "{fluid.test.express.user.harness.express}.options.messageDirs"
            }
        },
        messages: {
            type: "fluid.handlebars.inlineMessageBundlingMiddleware",
            options: {
                messageDirs: "{fluid.test.express.user.harness.express}.options.messageDirs",
                model: {
                    messageBundles: "{messageBundleLoader}.model.messageBundles"
                }
            }
        },
        api: {
            type: "fluid.express.user.api",
            options: {
                path:      "/api/user",
                namespace: "api",
                priority:  "after:inline",
                couch:  {
                    port: 25984
                },
                app: {
                    name: "fluid-express.user test harness..."
                }
            }
        },
        // A "gated" endpoint that can only be accessed if the user is logged in
        gated: {
            type: "fluid.express.user.middleware.loginRequired.router",
            options: {
                namespace:     "gated",
                path:          "/gated",
                priority:      "after:api",
                handlerGrades: ["fluid.test.express.user.harness.gated.handler"]
            }
        },
        // Serve up the rest of our static content (JS source, etc.)
        src: {
            type:  "fluid.express.router.static",
            options: {
                namespace: "src",
                path:      "/",
                priority:  "after:gated",
                content:   "%fluid-express-user/src"
            }
        },
        jsonErrors: {
            type: "fluid.express.middleware.error",
            options: {
                defaultStatusCode: 400, // TODO: discuss handling this in fluid-json-schema
                priority: "after:src"
            }
        }
    }
});

fluid.defaults("fluid.test.express.user.harness", {
    gradeNames: ["fluid.component"],
    port:       "5379",
    couchPort:  "25984",
    mailPort:   "5225",
    templateDirs: {
        user: "%fluid-express-user/src/templates",
        validation: "%fluid-json-schema/src/templates",
        testUser: "%fluid-express-user/tests/templates"
    },
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/", { port: "{that}.options.port"}]
        }
    },
    distributeOptions: [
        {
            source: "{that}.options.timeout",
            target: "{that fluid.express.requestAware.router}.options.timeout"
        },
        {
            source: "{that}.options.timeout",
            target: "{that fluid.express.contentAware.router}.options.timeout"
        },
        // Make sure any mailer components are aware of our outgoing mail port
        {
            source: "{that}.options.mailPort",
            target: "{that fluid.express.user.mailer}.options.transportOptions.port"
        }
    ],
    components: {
        express: {
            type: "fluid.test.express.user.harness.express",
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
            type: "fluid.test.express.user.couch",
            options: {
                couch: {
                    port: "{harness}.options.couchPort"
                }
            }
        },
        smtp: {
            type: "fluid.test.mail.smtp",
            options: {
                port: "{harness}.options.mailPort"
            }
        }
    }
});
