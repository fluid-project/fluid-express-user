/*

    The password reset process has two steps.  These tests exercise both steps independently and together.

 */
/* eslint-env node */
"use strict";
var fluid        = require("infusion");

require("../lib/");

var jqUnit       = require("node-jqunit");
var fs           = require("fs");

fluid.registerNamespace("fluid.tests.express.user.reset.caseHolder");

fluid.tests.express.user.reset.caseHolder.checkResetCode = function (code) {
    jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", code);
    return code;
};

fluid.tests.express.user.reset.caseHolder.checkEnvironmentForResetCode = function (testEnvironment) {
    fluid.tests.express.user.reset.caseHolder.extractResetCode(testEnvironment).then(fluid.tests.express.user.reset.caseHolder.checkResetCode);
};

fluid.tests.express.user.reset.caseHolder.extractResetCode = function (testEnvironment) {
    return fluid.test.express.user.extractCode(testEnvironment, "https?://[^/]+/api/user/reset/([a-z0-9-]+)");
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("fluid.tests.express.user.reset.caseHolder", {
    gradeNames: ["fluid.test.webdriver.caseHolder"],
    testUser: {
        username: "existing",
        email:    "existing@localhost",
        password: "Password1",
        confirm:  "Password1"
    },
    emailUser: {
        email:    "existing@localhost",
        password: "Password1",
        confirm:  "Password1"
    },
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        loginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        },
        bogusResetRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/reset/NONSENSE",
                method:   "POST"
            }
        },
        fullResetForgotRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/forgot",
                method:   "POST"
            }
        },
        fullResetResetRequest: {
            type: "fluid.test.express.user.request",
            options: {
                user: "{caseHolder}.options.testUser",
                endpoint: "api/user/reset/%code",
                method:   "POST",
                termMap: {
                    "code": "%code"
                }
            }
        },
        fullResetLoginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        },
        emailResetForgotRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/forgot",
                method:   "POST"
            }
        },
        emailResetResetRequest: {
            type: "fluid.test.express.user.request",
            options: {
                user: "{caseHolder}.options.testUser",
                endpoint: "api/user/reset/%code",
                method:   "POST",
                termMap: {
                    "code": "%code"
                }
            }
        },
        mismatchedPasswordsForgotRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/forgot",
                method:   "POST"
            }
        },
        mismatchedPasswordsResetRequest: {
            type: "fluid.test.express.user.request",
            options: {
                user: {
                    username: "existing",
                    email:    "existing@localhost",
                    password: "Password1",
                    confirm:  "MismatchedPassword1"
                },
                termMap: {
                    "code": "%code"
                },
                endpoint: "api/user/reset/%code",
                method:   "POST"
            }
        }
    },
    rawModules: [
        {
            name: "Testing 'forgot password' mechanism...",
            tests: [
                {
                    name: "Testing resetting a user's password with a bogus reset code...",
                    type: "test",
                    sequence: [
                        {
                            func: "{bogusResetRequest}.send",
                            args: [{ code: "utter-nonsense-which-should-never-work", password: "Something123", confirm: "Something123"  }]
                        },
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{bogusResetRequest}.events.onComplete",
                            args: ["{bogusResetRequest}.nativeResponse", "{arguments}.0", 400, ["isError"]] // response, body, statusCode, truthy, falsy, hasCurrentUser
                        }
                    ]
                },
                {
                    name: "Testing resetting a user's password, end-to-end...",
                    type: "test",
                    sequence: [
                        {
                            func: "{fullResetForgotRequest}.send",
                            args: [ { email: "{that}.options.testUser.email" } ]
                        },
                        // If we catch this event, the timing won't work out to cache the initial response.  We can safely ignore it for now.
                        //{
                        //    listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                        //    event: "{fullResetForgotRequest}.events.onComplete",
                        //    args: ["{fullResetForgotRequest}", "{fullResetForgotRequest}.nativeResponse", "{arguments}.0", 200]
                        //},
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.fullResetExtractCodeFromEmailAndReset",
                            event:    "{testEnvironment}.smtp.mailServer.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{fullResetResetRequest}"] // testEnvironment, resetRequest
                        },
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{fullResetResetRequest}.events.onComplete",
                            args: ["{fullResetResetRequest}.nativeResponse", "{arguments}.0", 200, ["message"]]
                        },
                        {
                            func: "{fullResetLoginRequest}.send",
                            args: [{ username: "{that}.options.testUser.username", password: "{that}.options.testUser.password"}]
                        },
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{fullResetLoginRequest}.events.onComplete",
                            args: ["{fullResetLoginRequest}.nativeResponse", "{arguments}.0", 200, ["user"]]
                        }
                    ]
                },
                // emailResetForgotRequest
                {
                    name: "Testing resetting a user's password using an email address...",
                    type: "test",
                    sequence: [
                        {
                            func: "{emailResetForgotRequest}.send",
                            args: [ { email: "{that}.options.testUser.email" } ]
                        },
                        // If we catch this event, the timing won't work out to cache the initial response.  We can safely ignore it for now.
                        //{
                        //    listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                        //    event: "{fullResetForgotRequest}.events.onComplete",
                        //    args: ["{fullResetForgotRequest}", "{fullResetForgotRequest}.nativeResponse", "{arguments}.0", 200]
                        //},
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.fullResetExtractCodeFromEmailAndReset",
                            event:    "{testEnvironment}.smtp.mailServer.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{emailResetResetRequest}"] // testEnvironment, resetRequest
                        },
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{emailResetResetRequest}.events.onComplete",
                            args: ["{emailResetResetRequest}.nativeResponse", "{arguments}.0", 200, ["message"]]
                        }
                    ]
                },
                {
                    name: "Attempt to reset a password with a mismatched confirmation password.",
                    type: "test",
                    sequence: [
                        {
                            func: "{mismatchedPasswordsForgotRequest}.send",
                            args: [ { email: "{that}.options.testUser.email" } ]
                        },
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.fullResetExtractCodeFromEmailAndReset",
                            event:    "{testEnvironment}.smtp.mailServer.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{mismatchedPasswordsResetRequest}"] // testEnvironment, resetRequest
                        },
                        {
                            listener: "fluid.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{mismatchedPasswordsResetRequest}.events.onComplete",
                            args: ["{mismatchedPasswordsResetRequest}.nativeResponse", "{arguments}.0", 400, ["message", "isError"], ["user"]]
                        }
                    ]
                }
            ]
        }
    ]
});


fluid.tests.express.user.reset.caseHolder.verifyResponse = function (response, body, statusCode, truthy, falsy, hasCurrentUser) {
    if (!statusCode) { statusCode = 200; }
    fluid.test.express.helpers.isSaneResponse(response, body, statusCode);

    var data = typeof body === "string" ? JSON.parse(body) : body;

    if (truthy) {
        truthy.forEach(function (key) {
            jqUnit.assertTrue("The data for '" + key + "' should be truthy...", data[key]);
        });
    }

    if (falsy) {
        falsy.forEach(function (key) {
            jqUnit.assertFalse("The data for '" + key + "' should be falsy...", data[key]);
        });
    }

    if (hasCurrentUser) {
        jqUnit.assertEquals("The current user should be returned.", "admin", fluid.get(data, "user.username"));
    }
};

// Listen for the email with the verification code and launch the verification request
fluid.tests.express.user.reset.caseHolder.fullResetExtractCodeFromEmailAndReset = function (testEnvironment, resetRequest) {
    var mailContent = fs.readFileSync(testEnvironment.smtp.mailServer.currentMessageFile);

    var simpleParser = require("mailparser").simpleParser;

    jqUnit.stop();
    simpleParser(mailContent).then(
        function (mailObject) {
            jqUnit.start();
            var content = mailObject.text;
            var resetCodeRegexp = new RegExp("https?://[^/]+/api/user/reset/([a-z0-9-]+)", "i");
            var matches = content.toString().match(resetCodeRegexp);

            jqUnit.assertNotNull("There should be a reset code in the email sent to the user.", matches);

            if (matches) {
                var code = matches[1];
                resetRequest.send({ password: resetRequest.options.user.password, confirm: resetRequest.options.user.confirm }, { termMap: { code: code } });
            }
        },
        function (error) {
            jqUnit.start();
            jqUnit.fail("There should be no mail errors: ", error);
        }
    );
};

fluid.defaults("fluid.tests.express.user.reset.environment", {
    gradeNames: ["fluid.test.express.user.environment"],
    port:       8779,
    mailPort:   8825,
    components: {
        caseHolder: {
            type: "fluid.tests.express.user.reset.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.express.user.reset.environment");
