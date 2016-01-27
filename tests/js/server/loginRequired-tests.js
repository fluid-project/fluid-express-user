/*

    Tests for the `loginRequired` middleware.

 */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("../lib/");

fluid.defaults("gpii.express.user.api.loginRequired.request", {
    gradeNames: ["kettle.test.request.httpCookie"],
    port:     "{testEnvironment}.options.apiPort",
    endpoint: "gated",
    method:   "GET",
    path: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/%endpoint", { port: "{that}.options.port", endpoint: "{that}.options.endpoint"}]
        }
    }
});

fluid.registerNamespace("gpii.express.user.api.loginRequired.test.caseHolder");


fluid.defaults("gpii.express.user.api.loginRequired.test.caseHolder", {
    gradeNames: ["gpii.express.user.tests.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        anonymousGatedRequest: {
            type: "gpii.express.user.api.loginRequired.request"
        },
        loginRequest: {
            type: "gpii.express.user.api.loginRequired.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        },
        loggedInGatedRequest: {
            type: "gpii.express.user.api.loginRequired.request"
        },
        alternateMethodGatedRequest: {
            type: "gpii.express.user.api.loginRequired.request",
            options: {
                method: "DELETE"
            }
        }
    },
    rawModules: [
        {
            tests: [

                {
                    name: "Testing accessing the gated endpoint without logging in...",
                    type: "test",
                    sequence: [
                        {
                            func: "{anonymousGatedRequest}.send"
                        },
                        {
                            listener: "gpii.express.user.api.test.verifyResponse",
                            event:    "{anonymousGatedRequest}.events.onComplete",
                            args:     ["{anonymousGatedRequest}.nativeResponse", "{arguments}.0", 401, ["message"], ["ok"]] // response, body, statusCode, truthy, falsy
                        }
                    ]
                },
                {
                    name: "Testing logging in and then accessing the gated endpoint...",
                    type: "test",
                    sequence: [
                        {
                            func: "{loginRequest}.send",
                            args: [{ username: "existing", password: "password" }]
                        },
                        {
                            listener: "fluid.identity",
                            event:    "{loginRequest}.events.onComplete"
                        },
                        {
                            func: "{loggedInGatedRequest}.send"
                        },
                        {
                            listener: "gpii.express.user.api.test.verifyResponse",
                            event:    "{loggedInGatedRequest}.events.onComplete",
                            args:     ["{loggedInGatedRequest}.nativeResponse", "{arguments}.0", 200, ["ok", "message"]] // response, body, statusCode, truthy, falsy
                        }
                    ]
                },
                {
                    name: "Testing accessing a non-gated method...",
                    type: "test",
                    sequence: [
                        {
                            func: "{alternateMethodGatedRequest}.send"
                        },
                        {
                            listener: "gpii.express.user.api.test.verifyResponse",
                            event:    "{alternateMethodGatedRequest}.events.onComplete",
                            args:     ["{alternateMethodGatedRequest}.nativeResponse", "{arguments}.0", 200, ["ok", "message"]] // response, body, statusCode, truthy, falsy
                        }
                    ]
                }
            ]
        }
    ]
});

gpii.express.user.tests.environment({
    apiPort:   8788,
    pouchPort: 8744,
    mailPort:  7925,
    components: {
        testCaseHolder: {
            type: "gpii.express.user.api.loginRequired.test.caseHolder"
        }
    }
});
