/*

  Test the login, logout, and "current user" APIs.

 */
/* eslint-env node */
"use strict";
var fluid        = require("infusion");

require("../../../");
require("../lib/");

var jqUnit       = require("node-jqunit");

fluid.registerNamespace("fluid.tests.express.user.login.caseHolder");

// An expander to generate a new username every time
fluid.tests.express.user.login.caseHolder.generateUser = function () {
    var timestamp = Date.now();
    return {
        username: "user-" + timestamp,
        password: "user-" + timestamp,
        email:    "user-" + timestamp + "@localhost",
        roles:    []
    };
};

// An expander to generate a new password so that we can confirm that the password reset function actually works more than once.
fluid.tests.express.user.login.caseHolder.generatePassword = function () {
    var timestamp = Date.now();
    return "password-" + timestamp;
};

fluid.tests.express.user.login.caseHolder.verifyResponse = function (response, body, statusCode, truthy, falsy, hasCurrentUser) {
    fluid.test.express.user.verifyResponse(response, body, statusCode, truthy, falsy);

    var data = typeof body === "string" ? JSON.parse(body) : body;

    if (hasCurrentUser) {
        jqUnit.assertEquals("The current user should be returned.", "existing", fluid.get(data, "user.username"));
    }
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("fluid.tests.express.user.login.caseHolder", {
    gradeNames: ["fluid.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        loginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                path: "/api/user/login",
                method: "POST"
            }
        },
        currentUserLoggedInRequest: {
            type: "fluid.test.express.user.request",
            options: {
                path: "/api/user/current",
                method: "GET"
            }
        },
        logoutRequest: {
            type: "fluid.test.express.user.request",
            options: {
                path: "/api/user/logout",
                method: "GET"
            }
        },
        currentUserLoggedOutRequest: {
            type: "fluid.test.express.user.request",
            options: {
                path: "/api/user/current",
                method: "GET"
            }
        },
        bogusLoginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                path: "/api/user/login",
                method: "POST"
            }
        },
        unverifiedLoginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                path: "/api/user/login",
                method: "POST"
            }
        }
    },
    rawModules: [
        {
            name: "Testing login functions...",
            tests: [
                {
                    name: "Testing full login/logout cycle...",
                    type: "test",
                    sequence: [
                        {
                            func: "{loginRequest}.send",
                            args: [{ username: "existing", password: "password" }]
                        },
                        {
                            listener: "fluid.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{loginRequest}.events.onComplete",
                            args: ["{loginRequest}.nativeResponse", "{arguments}.0", 200, ["user"], null, true] // response, body, statusCode, truthy, falsy, hasCurrentUser
                        },
                        {
                            func: "{currentUserLoggedInRequest}.send"
                        },
                        {
                            listener: "fluid.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{currentUserLoggedInRequest}.events.onComplete",
                            args: ["{currentUserLoggedInRequest}.nativeResponse", "{arguments}.0", 200, ["user"], null, true]
                        },
                        {
                            func: "{logoutRequest}.send"
                        },
                        {
                            listener: "fluid.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{logoutRequest}.events.onComplete",
                            args: ["{logoutRequest}.nativeResponse", "{arguments}.0", 200, ["message"], ["user"]]
                        },
                        {
                            func: "{currentUserLoggedOutRequest}.send"
                        },
                        {
                            listener: "fluid.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{currentUserLoggedOutRequest}.events.onComplete",
                            args: ["{currentUserLoggedOutRequest}.nativeResponse", "{arguments}.0",  401, ["isError"], ["user"]]
                        }
                    ]
                },
                {
                    name: "Testing logging in with a bogus username/password...",
                    type: "test",
                    sequence: [
                        {
                            func: "{bogusLoginRequest}.send",
                            args: [{ username: "bogus", password: "bogus" }]
                        },
                        {
                            listener: "fluid.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{bogusLoginRequest}.events.onComplete",
                            args: ["{bogusLoginRequest}.nativeResponse", "{arguments}.0", 401, ["isError"], ["user"]]
                        }
                    ]
                },
                {
                    name: "Testing logging in with an unverified account...",
                    type: "test",
                    sequence: [
                        {
                            func: "{unverifiedLoginRequest}.send",
                            args: [{ username: "unverified", password: "unverified" }]
                        },
                        {
                            listener: "fluid.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{unverifiedLoginRequest}.events.onComplete",
                            args: ["{unverifiedLoginRequest}.nativeResponse", "{arguments}.0", 401, ["isError"], ["user"]]
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("fluid.tests.express.user.login.environment", {
    gradeNames: ["fluid.test.express.user.environment"],
    port:       8778,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "fluid.tests.express.user.login.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.express.user.login.environment");
