/*

  An API endpoint that returns the current user's information if they are logged in, or an error message if they are not.

 */
/* eslint-env node */
"use strict";
var fluid  = require("infusion");

fluid.registerNamespace("fluid.express.user.current.handler");

fluid.express.user.current.handler.verifyUserSession = function (that) {
    if (that.options.request.session && that.options.request.session[that.options.sessionKey]) {
        that.sendResponse(200, { user: that.options.request.session[that.options.sessionKey]});
    }
    else {
        that.sendResponse(401, { isError: true, message: "You are not currently logged in."});
    }
};

fluid.defaults("fluid.express.user.current.handler", {
    gradeNames: ["fluid.express.handler"],
    sessionKey: "_fluid_user",
    invokers: {
        handleRequest: {
            funcName: "fluid.express.user.current.handler.verifyUserSession",
            args:     ["{that}"]
        }
    }
});

fluid.defaults("fluid.express.user.current", {
    gradeNames:    ["fluid.express.middleware.requestAware"],
    path:          "/current",
    handlerGrades: ["fluid.express.user.current.handler"]
});
