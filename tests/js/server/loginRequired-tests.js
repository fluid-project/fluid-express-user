/*

    Tests for the `loginRequired` middleware.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../lib/");

fluid.defaults("gpii.express.user.loginRequired.request", {
    gradeNames: ["gpii.test.express.user.request"],
    endpoint:   "gated",
    method:     "GET"
});

fluid.defaults("gpii.tests.express.user.loginRequired.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        anonymousGatedRequest: {
            type: "gpii.express.user.loginRequired.request"
        },
        loginRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        },
        loggedInGatedRequest: {
            type: "gpii.express.user.loginRequired.request"
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
                            listener: "gpii.test.express.user.verifyResponse",
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
                            listener: "gpii.test.express.user.verifyResponse",
                            event:    "{loggedInGatedRequest}.events.onComplete",
                            args:     ["{loggedInGatedRequest}.nativeResponse", "{arguments}.0", 200, ["message"]] // response, body, statusCode, truthy, falsy
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.loginRequired.environment", {
    gradeNames: ["gpii.test.express.user.environment"],
    port:   8788,
    mailPort:  7925,
    components: {
        testCaseHolder: {
            type: "gpii.tests.express.user.loginRequired.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.express.user.loginRequired.environment");
