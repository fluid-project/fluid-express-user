/*

    Tests for the `loginRequired` middleware.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../lib/");

fluid.defaults("fluid.express.user.loginRequired.request", {
    gradeNames: ["fluid.test.express.user.request"],
    endpoint:   "gated",
    method:     "GET"
});

fluid.defaults("fluid.tests.express.user.loginRequired.caseHolder", {
    gradeNames: ["fluid.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        anonymousGatedRequest: {
            type: "fluid.express.user.loginRequired.request"
        },
        loginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        },
        loggedInGatedRequest: {
            type: "fluid.express.user.loginRequired.request"
        }
    },
    rawModules: [
        {
            name: "Testing 'login required' grade...",
            tests: [

                {
                    name: "Testing accessing the gated endpoint without logging in...",
                    type: "test",
                    sequence: [
                        {
                            func: "{anonymousGatedRequest}.send"
                        },
                        {
                            listener: "fluid.test.express.user.verifyResponse",
                            event:    "{anonymousGatedRequest}.events.onComplete",
                            args:     ["{anonymousGatedRequest}.nativeResponse", "{arguments}.0", 401, ["isError", "message"]] // response, body, statusCode, truthy, falsy
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
                            listener: "fluid.test.express.user.verifyResponse",
                            event:    "{loggedInGatedRequest}.events.onComplete",
                            args:     ["{loggedInGatedRequest}.nativeResponse", "{arguments}.0", 200, ["message"]] // response, body, statusCode, truthy, falsy
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("fluid.tests.express.user.loginRequired.environment", {
    gradeNames: ["fluid.test.express.user.environment"],
    port:   8788,
    mailPort:  7925,
    components: {
        testCaseHolder: {
            type: "fluid.tests.express.user.loginRequired.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.express.user.loginRequired.environment");
