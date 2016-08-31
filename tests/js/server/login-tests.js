/*

  Test the login, logout, and "current user" APIs.

 */
/* eslint-env node */
"use strict";

var fluid        = require("infusion");
var gpii         = fluid.registerNamespace("gpii");

require("../../../");
require("../lib/");

var jqUnit       = require("node-jqunit");

fluid.registerNamespace("gpii.tests.express.user.login.caseHolder");

// An expander to generate a new username every time
gpii.tests.express.user.login.caseHolder.generateUser = function () {
    var timestamp = Date.now();
    return {
        username: "user-" + timestamp,
        password: "user-" + timestamp,
        email:    "user-" + timestamp + "@localhost",
        roles:    []
    };
};

// An expander to generate a new password so that we can confirm that the password reset function actually works more than once.
gpii.tests.express.user.login.caseHolder.generatePassword = function () {
    var timestamp = Date.now();
    return "password-" + timestamp;
};

gpii.tests.express.user.login.caseHolder.verifyResponse = function (response, body, statusCode, truthy, falsy, hasCurrentUser) {
    gpii.test.express.user.verifyResponse(response, body, statusCode, truthy, falsy);

    var data = typeof body === "string" ? JSON.parse(body) : body;

    if (hasCurrentUser) {
        jqUnit.assertEquals("The current user should be returned.", "existing", data.user.username);
    }
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.tests.express.user.login.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        loginRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method: "POST"
            }
        },
        currentUserLoggedInRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/current",
                method: "GET"
            }
        },
        logoutRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/logout",
                method: "GET"
            }
        },
        currentUserLoggedOutRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/current",
                method: "GET"
            }
        },
        bogusLoginRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method: "POST"
            }
        },
        unverifiedLoginRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/login",
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
                            listener: "gpii.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{loginRequest}.events.onComplete",
                            args: ["{loginRequest}.nativeResponse", "{arguments}.0", 200, ["ok", "user"], null, true]
                        },
                        {
                            func: "{currentUserLoggedInRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{currentUserLoggedInRequest}.events.onComplete",
                            args: ["{currentUserLoggedInRequest}.nativeResponse", "{arguments}.0", 200, ["ok", "user"], null, true]
                        },
                        {
                            func: "{logoutRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{logoutRequest}.events.onComplete",
                            args: ["{logoutRequest}.nativeResponse", "{arguments}.0", 200, ["ok"], ["user"]]
                        },
                        {
                            func: "{currentUserLoggedOutRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{currentUserLoggedOutRequest}.events.onComplete",
                            args: ["{currentUserLoggedOutRequest}.nativeResponse", "{arguments}.0",  401, null, ["ok", "user"]]
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
                            listener: "gpii.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{bogusLoginRequest}.events.onComplete",
                            args: ["{bogusLoginRequest}.nativeResponse", "{arguments}.0", 401, null, ["ok", "user"]]
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
                            listener: "gpii.tests.express.user.login.caseHolder.verifyResponse",
                            event: "{unverifiedLoginRequest}.events.onComplete",
                            args: ["{unverifiedLoginRequest}.nativeResponse", "{arguments}.0", 401, null, ["ok", "user"]]
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.login.environment", {
    gradeNames: ["gpii.test.express.user.environment"],
    port:       8778,
    pouchPort:  8764,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "gpii.tests.express.user.login.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.express.user.login.environment");
