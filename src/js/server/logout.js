"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");


fluid.registerNamespace("gpii.express.user.logout.handler");

gpii.express.user.logout.handler.destroyUserSession = function (that) {
    if (that.options.request.session && that.options.request.session[that.options.sessionKey]) {
        delete that.options.request.session[that.options.sessionKey];
    }

    that.sendResponse(200, { ok: true, message: "You are now logged out."});
};

fluid.defaults("gpii.express.user.logout.handler", {
    gradeNames: ["gpii.express.handler"],
    sessionKey:  "_gpii_user",
    invokers: {
        handleRequest: {
            funcName: "gpii.express.user.logout.handler.destroyUserSession",
            args:     ["{that}"]
        }
    }
});

fluid.defaults("gpii.express.user.logout", {
    gradeNames:    ["gpii.express.middleware.requestAware"],
    handlerGrades: ["gpii.express.user.logout.handler"],
    path:          "/logout",
    method:        "get"
});

