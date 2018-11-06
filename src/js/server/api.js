/*

    Mount all the feature-specific endpoints under a single umbrella class.  Returns the API documentation by default.

    See the documentation for more details:

    https://github.com/GPII/gpii-express-user/blob/master/docs/apiComponent.md

 */
/* eslint-env node */
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
require("./utils.js");

fluid.registerNamespace("gpii.express.user.api");

fluid.defaults("gpii.express.user.api", {
    gradeNames:   ["gpii.express.router"],
    path:         "/user",
    method:       "use",
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
            "source": "{that}.options.couch",
            "target": "{that gpii.express.user.utils}.options.couch"
        },
        {
            source: "{that}.options.app",
            target: "{that gpii.express.router}.options.app"
        },
        {
            source: "{that}.options.schemaDirs",
            target: "{that gpii.schema.parser}.options.schemaDirs"
        }
    ],
    components: {
        utils: {
            type:     "gpii.express.user.utils"
        },
        // API Endpoints (routers)
        current: {
            type:     "gpii.express.user.current",
            options: {
                priority: "after:session"
            }
        },
        forgot: {
            type:     "gpii.express.user.forgot",
            options: {
                priority: "after:session"
            }
        },
        login: {
            type: "gpii.express.user.login",
            options: {
                priority: "after:session",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onLoginReady.fire"
                    }
                }
            }
        },
        logout: {
            type:     "gpii.express.user.logout",
            options: {
                priority: "after:session"
            }
        },
        reset: {
            type: "gpii.express.user.reset",
            options: {
                priority: "after:session",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onResetReady.fire"
                    }
                }
            }
        },
        signup: {
            type:     "gpii.express.user.signup",
            options: {
                priority: "after:session",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.api}.events.onSignupReady.fire"
                    }
                }
            }
        },
        verify: {
            type:     "gpii.express.user.verify",
            options: {
                priority: "after:session"
            }
        },
        docs: {
            type:     "gpii.express.api.docs.router",
            options: {
                priority: "last"
            }
        }
    }
});


/*

    A mix-in grade that adds the required session middleware to an instance of `gpii.express` or `gpii.express.router`.

    See the documentation for details:

    https://github.com/GPII/gpii-express-user/blob/master/docs/apiComponent.md

 */
fluid.defaults("gpii.express.user.withRequiredMiddleware", {
    components: {
        json: {
            type: "gpii.express.middleware.bodyparser.json",
            options: {
                priority: "first"
            }
        },
        urlencoded: {
            type: "gpii.express.middleware.bodyparser.urlencoded",
            options: {
                priority: "after:json"
            }
        },
        handlebars: {
            type: "gpii.express.hb",
            options: {
                priority: "after:urlencoded",
                templateDirs: "{gpii.express.user.withRequiredMiddleware}.options.templateDirs",
                components: {
                    renderer: {
                        options: {
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
                    }
                }
            }
        },
        cookieparser: {
            type:     "gpii.express.middleware.cookieparser",
            options: {
                priority: "first"
            }
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
