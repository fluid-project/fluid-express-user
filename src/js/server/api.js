/*

    Mount all the feature-specific endpoints under a single umbrella class.  Returns the API documentation by default.

    You must have all of the following middleware loaded before the routers in this module:

    * `gpii.express.middleware.bodyparser.json`
    * `gpii.express.middleware.bodyparser.urlencoded`
    * `gpii.express.middleware.cookieparser`
    * `gpii.express.middleware.session`

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
        },
        docs: {
            type:     "gpii.express.api.docs.router",
            priority: "last"
        }
    }
});

// A mix-in grade to add the required session middleware.  You can mix this in with the api itself, but generally you
// will want to mix it in to your `gpii.express` instance so that routers outside of the API can see the same session
// data and use the `loginRequired` grade.
fluid.defaults("gpii.express.user.api.withRequiredMiddleware", {
    gradeNames: ["fluid.component"],
    components: {
        json: {
            type: "gpii.express.middleware.bodyparser.json"
        },
        urlencoded: {
            type: "gpii.express.middleware.bodyparser.urlencoded",
            priority: "after:json"
        },
        handlebars: {
            type: "gpii.express.hb",
            options: {
                priority: "after:urlencoded",
                templateDirs: "{gpii.express.user.tests.harness}.options.templateDirs",
                components: {
                    initBlock: {
                        options: {
                            contextToOptionsRules: {
                                req: "req"
                            }
                        }
                    }
                }
            }
        },
        cookieparser: {
            type:     "gpii.express.middleware.cookieparser"
        },
        session: {
            type: "gpii.express.middleware.session",
            options: {
                priority: "after:cookieparser",
                sessionOptions: {
                    secret: "Printer, printer take a hint-ter."
                }
            }
        }
    }
});