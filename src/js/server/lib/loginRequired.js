/*

    Middleware that prevents access to an API endpoint unless a user is already logged in.  This does not provide
    any additional permission checks beyond checking for the existance of the `req.session.user` variable.

    In order to use this component, it must have access to the same session secret as the session middleware used by
    the {{gpii-express-user}} API.  Otherwise, it will not be able to correctly decipher the session contents.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-express");

fluid.registerNamespace("gpii.express.user.middleware.loginRequired");

gpii.express.user.middleware.rejectOrForward  = function (that, req, res, next) {
    if (req && req.session && req.session[that.options.sessionKey]) {
        next();
    }
    else {
        next({ isError: true, statusCode: 401, message: that.options.messages.failure});
    }
};

fluid.defaults("gpii.express.user.middleware.loginRequired", {
    gradeNames:    ["gpii.express.middleware"],
    messages: {
        failure: "You must be logged in to use this API endpoint."
    },
    sessionKey:    "_gpii_user", // Must matched what's used in /api/user/login
    namespace:     "loginRequired", // Namespace to allow other middleware to put themselves in the chain before or after us.
    invokers: {
        middleware: {
            funcName: "gpii.express.user.middleware.rejectOrForward",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    }
});

fluid.defaults("gpii.express.user.middleware.loginRequired.router", {
    gradeNames: ["gpii.express.router"],
    components: {
        gateKeeper: {
            type: "gpii.express.user.middleware.loginRequired"
        },
        innerRouter: {
            type:     "gpii.express.middleware.requestAware",
            options: {
                priority:      "after:loginRequired",
                handlerGrades: "{gpii.express.user.middleware.loginRequired.router}.options.handlerGrades",
                method:        "{gpii.express.user.middleware.loginRequired.router}.options.method",
                path:          "/"
            }
        }
    }
});
