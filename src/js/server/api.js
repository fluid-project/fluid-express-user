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
            type: "gpii.express.middleware.bodyparser.json"
        },
        urlencoded: {
            type: "gpii.express.middleware.bodyparser.urlencoded"
        },
        cookieparser: {
            type: "gpii.express.middleware.cookieparser"
        },
        docs: {
            type: "gpii.express.api.docs.router"
        },
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
        },

        // API Endpoints (routers)
        current: {
            type: "gpii.express.user.api.current"
        },
        forgot: {
            type: "gpii.express.user.api.forgot"
        },
        login: {
            type: "gpii.express.user.api.login",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onLoginReady.fire"
                    }
                }
            }
        },
        logout: {
            type: "gpii.express.user.api.logout"
        },
        reset: {
            type: "gpii.express.user.api.reset",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onResetReady.fire"
                    }
                }
            }
        },
        signup: {
            type: "gpii.express.user.api.signup",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onSignupReady.fire"
                    }
                }
            }
        },
        verify: {
            type: "gpii.express.user.api.verify"
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
