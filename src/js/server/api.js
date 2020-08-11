/*

    Mount all the feature-specific endpoints under a single umbrella class.  Returns the API documentation by default.

    See the documentation for more details:

    https://github.com/fluid-project/fluid-express-user/blob/master/docs/apiComponent.md

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("fluid-express");
require("./current.js");
require("./docs.js");
require("./forgot.js");
require("./login.js");
require("./logout.js");
require("./reset.js");
require("./signup.js");
require("./verify.js");
require("./utils.js");

fluid.registerNamespace("fluid.express.user.api");

fluid.defaults("fluid.express.user.api", {
    gradeNames:   ["fluid.express.router"],
    path:         "/user",
    method:       "use",
    templateDirs: {
        user: "%fluid-express-user/src/templates",
        validation: "%fluid-json-schema/src/templates"
    },
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
        port: 5984,
        userDbName: "users",
        userDbUrl: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port/%userDbName", { port: "{that}.options.couch.port", userDbName: "{that}.options.couch.userDbName" }]
            }
        }
    },
    distributeOptions: [
        {
            "source": "{that}.options.couch",
            "target": "{that fluid.express.router}.options.couch"
        },
        {
            "source": "{that}.options.couch",
            "target": "{that fluid.express.user.utils}.options.couch"
        },
        {
            source: "{that}.options.app",
            target: "{that fluid.express.router}.options.app"
        },
        {
            source: "{that}.options.schemaDirs",
            target: "{that fluid.schema.parser}.options.schemaDirs"
        }
    ],
    components: {
        utils: {
            type:     "fluid.express.user.utils"
        },
        // API Endpoints (routers)
        current: {
            type:     "fluid.express.user.current",
            options: {
                priority: "after:session"
            }
        },
        forgot: {
            type:     "fluid.express.user.forgot",
            options: {
                priority: "after:session"
            }
        },
        login: {
            type: "fluid.express.user.login",
            options: {
                priority: "after:session"
            }
        },
        logout: {
            type:     "fluid.express.user.logout",
            options: {
                priority: "after:session"
            }
        },
        reset: {
            type: "fluid.express.user.reset",
            options: {
                priority: "after:session"
            }
        },
        signup: {
            type:     "fluid.express.user.signup",
            options: {
                priority: "after:session"
            }
        },
        verify: {
            type:     "fluid.express.user.verify",
            options: {
                priority: "after:session"
            }
        },
        docs: {
            type:     "fluid.express.api.docs.router",
            options: {
                priority: "last"
            }
        }
    }
});


/*

    A mix-in grade that adds the required session middleware to an instance of `fluid.express` or `fluid.express.router`.

    See the documentation for details:

    https://github.com/fluid-project/fluid-express-user/blob/master/docs/apiComponent.md

 */
fluid.defaults("fluid.express.user.withRequiredMiddleware", {
    components: {
        json: {
            type: "fluid.express.middleware.bodyparser.json",
            options: {
                priority: "first"
            }
        },
        urlencoded: {
            type: "fluid.express.middleware.bodyparser.urlencoded",
            options: {
                priority: "after:json"
            }
        },
        handlebars: {
            type: "fluid.express.hb",
            options: {
                priority: "after:urlencoded",
                templateDirs: "{fluid.express.user.withRequiredMiddleware}.options.templateDirs",
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
            type:     "fluid.express.middleware.cookieparser",
            options: {
                priority: "first"
            }
        },
        session: {
            type: "fluid.express.middleware.session",
            options: {
                priority: "after:cookieparser",
                sessionOptions: {
                    secret: "Printer, printer take a hint-ter."
                }
            }
        }
    }
});
