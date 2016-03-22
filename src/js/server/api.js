/*

  Mount all the feature-specific endpoints under a single umbrella class.  Returns the API documentation by default.

 */
"use strict";
var fluid = require("infusion");

require("gpii-express");
require("./current.js");
require("./docs.js");
require("./forgot.js");
require("./login.js");
require("./logout.js");
require("./reset.js");
require("./signup.js");
require("./verify.js");

fluid.registerNamespace("gpii.express.user.api");

fluid.defaults("gpii.express.user.api", {
    gradeNames: ["gpii.express.router.passthrough"],
    path:       "/user",
    method:     "use",
    templateDirs: ["%gpii-express-user/src/templates", "%gpii-json-schema/src/templates"],
    schemaDirs:    "%gpii-express-user/src/schemas",
    events: {
        onLoginReady:  "null",
        onResetReady:  "null",
        onSignupReady: "null",
        onReady: {
            events: {
                onLoginReady:  "onLoginReady",
                onResetReady:  "onResetReady",
                onSignupReady: "onSignupReady"
            }
        }
    },
    couch: {
        userDbName: "_users",
        userDbUrl: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://admin:admin@localhost:%port/%userDbName", "{that}.options.couch"]
            }
        }
    },
    distributeOptions: [
        {
            "source": "{that}.options.couch",
            "target": "{that gpii.express.router}.options.couch"
        },
        {
            source: "{that}.options.app",
            target: "{that gpii.express.router}.options.app"
        },
        {
            source: "{that}.options.schemaDirs",
            target: "{that gpii.express.router}.options.schemaDirs"
        }
    ],
    components: {
        // Required middleware
        json: {
            type: "gpii.express.middleware.bodyparser.json",
            priority: "before:session"
        },
        urlencoded: {
            type: "gpii.express.middleware.bodyparser.urlencoded",
            priority: "before:session"
        },
        cookieparser: {
            type:     "gpii.express.middleware.cookieparser",
            priority: "before:session"
        },
        docs: {
            type:     "gpii.express.api.docs.router",
            priority: "before:session"
        },
        session: {
            type: "gpii.express.middleware.session",
            options: {
                // We use "session" as the last bit of middleware in the chain so that we can ensure all middleware is
                // loaded before our routers.
                namespace: "session",
                config: {
                    express: {
                        session: {
                            secret: "Printer, printer take a hint-ter."
                        }
                    }
                }
            }
        },

        // API Endpoints (routers)
        current: {
            type:     "gpii.express.user.api.current",
            priority: "after:session"
        },
        forgot: {
            type:     "gpii.express.user.api.forgot",
            priority: "after:session"
        },
        login: {
            type: "gpii.express.user.api.login",
            priority: "after:session",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onLoginReady.fire"
                    }
                }
            }
        },
        logout: {
            type:     "gpii.express.user.api.logout",
            priority: "after:session"
        },
        reset: {
            type: "gpii.express.user.api.reset",
            priority: "after:session",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onResetReady.fire"
                    }
                }
            }
        },
        signup: {
            type:     "gpii.express.user.api.signup",
            priority: "after:session",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onSignupReady.fire"
                    }
                }
            }
        },
        verify: {
            type:     "gpii.express.user.api.verify",
            priority: "after:session"
        }
    }
});

// An instance of `gpii.express.user.api` that already has the required session middleware wired in
//
// Generally you will want to start with the base grade and provide your own.
fluid.defaults("gpii.express.user.api.hasMiddleware", {
    gradeNames: ["gpii.express.user.api"],
    components: {
        session: {
            type: "gpii.express.middleware.session",
            options: {
                config: {
                    express: {
                        session: {
                            secret: "Printer, printer take a hint-ter."
                        }
                    }
                }
            }
        }
    }
});
