/*

  An API endpoint that returns the current user's information if they are logged in, or an error message if they are not.

 */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.express.user.current.handler");

gpii.express.user.current.handler.verifyUserSession = function (that) {
    if (that.options.request.session && that.options.request.session[that.options.sessionKey]) {
        that.sendResponse(200, { ok: true, user: that.options.request.session[that.options.sessionKey]});
    }
    else {
        that.sendResponse(401, { ok: false, message: "You are not currently logged in."});
    }
};

fluid.defaults("gpii.express.user.current.handler", {
    gradeNames: ["gpii.express.handler"],
    sessionKey: "_gpii_user",
    invokers: {
        handleRequest: {
            funcName: "gpii.express.user.current.handler.verifyUserSession",
            args:     ["{that}"]
        }
    }
});

fluid.defaults("gpii.express.user.current", {
    gradeNames:    ["gpii.express.middleware.requestAware"],
    path:          "/current",
    handlerGrades: ["gpii.express.user.current.handler"]
});
