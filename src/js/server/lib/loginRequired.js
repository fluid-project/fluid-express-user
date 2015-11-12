/*

    Middleware that prevents access to an API endpoint unless a user is already logged in.  This does not provide
    any additional permission checks beyond checking for the existance of the `req.session.user` variable.

    In order to use this component, it must have access to the same session secret as the session middleware used by
    the {{gpii-express-user}} API.  Otherwise, it will not be able to correctly decipher the session contents.

 */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-express");
require("gpii-json-schema");

fluid.registerNamespace("gpii.express.user.middleware.loginRequired");

gpii.express.user.middleware.rejectOrForward  = function (that, req, res, next) {
    if (req && req.session && req.session[that.options.sessionKey]) {
        next();
    }
    else {
        that.events.onUnauthorizedRequest.fire(req, res);
    }
};

// TODO: Once this is implemented, it should be moved to `gpii-express-user`
fluid.defaults("gpii.express.user.middleware.loginRequired", {
    gradeNames: ["gpii.express.middleware"],
    failureMessage: "You must be logged in to use this API endpoint.",
    sessionKey: "_gpii_user", // Must matched what's used in /api/user/login
    events: {
        onUnauthorizedRequest: null
    },
    invokers: {
        middleware: {
            funcName: "gpii.express.user.middleware.rejectOrForward",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    dynamicComponents: {
        requestHandler: {
            createOnEvent: "onUnauthorizedRequest",
            type:          "gpii.schema.handler",
            options: {
                request:    "{arguments}.0",
                response:   "{arguments}.1",
                schemaKey:  "message.json",
                schemaUrl:  "http://ul.gpii.net/api/schemas/message.json",
                invokers: {
                    handleRequest: {
                        // TODO:  Why can't we just use `{that}.sendResponse` here?
                        funcName: "gpii.schema.handler.sendResponse",
                        args: ["{that}", 401, { ok: false, message: "{gpii.express.user.middleware.loginRequired}.options.failureMessage"}]
                    }
                }
            }
        }
    }
});