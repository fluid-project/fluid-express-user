/* eslint-env node */
"use strict";
var fluid  = require("infusion");

fluid.registerNamespace("fluid.express.user.logout.handler");

fluid.express.user.logout.handler.destroyUserSession = function (that) {
    if (that.options.request.session && that.options.request.session[that.options.sessionKey]) {
        delete that.options.request.session[that.options.sessionKey];
    }

    that.sendResponse(200, { message: "You are now logged out."});
};

fluid.defaults("fluid.express.user.logout.handler", {
    gradeNames: ["fluid.express.handler"],
    sessionKey:  "_fluid_user",
    invokers: {
        handleRequest: {
            funcName: "fluid.express.user.logout.handler.destroyUserSession",
            args:     ["{that}"]
        }
    }
});

fluid.defaults("fluid.express.user.logout", {
    gradeNames:    ["fluid.express.middleware.requestAware"],
    handlerGrades: ["fluid.express.user.logout.handler"],
    path:          "/logout",
    method:        "get"
});
