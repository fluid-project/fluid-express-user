/*

    The user self-signup is a two step process.  These tests exercise both steps independently and together.

 */
/* eslint-env node */
"use strict";
var fluid        = require("infusion");

require("../lib/");

var jqUnit = require("node-jqunit");

fluid.registerNamespace("fluid.tests.express.user.signup.caseHolder");

fluid.tests.express.user.signup.caseHolder.verifyResponse = function (response, body, statusCode, truthy, falsy, hasCurrentUser) {
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
        jqUnit.assertEquals("The current user should be returned.", "admin", data.user.name);
    }
};

// Listen for the email with the verification code and launch the verification request
fluid.tests.express.user.signup.caseHolder.fullSignupVerifyEmail = function (signupRequest, verificationRequest, testEnvironment) {
    fluid.tests.express.user.signup.caseHolder.extractVerificationCode(testEnvironment).then(fluid.tests.express.user.signup.caseHolder.checkVerificationCode).then(function (code) {
        signupRequest.code = code;
        verificationRequest.send({}, { headers: { "Accept": "application/json" }, termMap: { code: code } });
    });
};

fluid.tests.express.user.signup.caseHolder.checkVerificationCode = function (code) {
    jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", code);

    return code;
};

fluid.tests.express.user.signup.caseHolder.checkEnvironmentForVerificationCode = function (testEnvironment) {
    fluid.tests.express.user.signup.caseHolder.extractVerificationCode(testEnvironment).then(fluid.tests.express.user.signup.caseHolder.checkVerificationCode);
};

fluid.tests.express.user.signup.caseHolder.extractVerificationCode = function (testEnvironment) {
    return fluid.test.express.user.extractCode(testEnvironment, "https?://[^/]+/api/user/verify/([a-z0-9-]+)");
};

fluid.defaults("fluid.tests.express.user.signup.verifyRequest", {
    gradeNames: ["fluid.test.express.user.request"],
    endpoint: "api/user/verify/%code",
    termMap: {
        "code": "%code"
    },
    method: "GET"
});

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("fluid.tests.express.user.signup.caseHolder", {
    gradeNames: ["fluid.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        duplicateUserCreateRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                method:   "POST"
            }
        },
        mismatchedPasswordCreateRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                method:   "POST"
            }
        },
        incompleteUserCreateRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                method:   "POST"
            }
        },
        bogusVerificationRequest: {
            type: "fluid.tests.express.user.signup.verifyRequest"
        },
        resendVerification: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/verify/resend",
                method: "POST"
            }
        },
        resendVerificationForVerifiedUser: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/verify/resend",
                method: "POST"
            }
        },
        resendVerificationForBogusUser: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/verify/resend",
                method: "POST"
            }
        },
        fullSignupInitialRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                user: {
                    expander: {
                        funcName: "fluid.test.express.user.generateUser"
                    }
                },
                method: "POST"
            }
        },
        fullSignupVerifyVerificationRequest: {
            type: "fluid.tests.express.user.signup.verifyRequest"
        },
        fullSignupLoginRequest: {
            type: "fluid.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        }
    },
    rawModules: [
        {
            name: "Testing self signup mechanism...",
            tests: [
                {
                    name: "Testing creating an account without providing the required information...",
                    type: "test",
                    sequence: [
                        {
                            func: "{incompleteUserCreateRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{incompleteUserCreateRequest}.events.onComplete",
                            args:     ["{incompleteUserCreateRequest}.nativeResponse", "{arguments}.0", 400, [], ["isValid", "user"]]
                            // TODO: Add a transforming error handler to ensure that validation errors also have `isError` set.
                        }
                    ]
                },
                {
                    name: "Testing creating an account with the same email address as an existing account...",
                    type: "test",
                    sequence: [
                        {
                            func: "{duplicateUserCreateRequest}.send",
                            args: [{ username: "new", password: "NewPassw0rd", confirm: "NewPassw0rd", email: "existing@localhost"}]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{duplicateUserCreateRequest}.events.onComplete",
                            args:     ["{duplicateUserCreateRequest}.nativeResponse", "{arguments}.0", 403, ["isError"], ["user"]] // response, body, statusCode, truthy, falsy, hasCurrentUser
                        }
                    ]
                },
                {
                    name: "Attempt to create an account with a mismatched password and confirmation password.",
                    type: "test",
                    sequence: [
                        {
                            func: "{mismatchedPasswordCreateRequest}.send",
                            args: [{ username: "new", password: "NewPassw0rd", confirm: "NewerPassw0rd", email: "newboot@localhost"}]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{mismatchedPasswordCreateRequest}.events.onComplete",
                            args:     ["{mismatchedPasswordCreateRequest}.nativeResponse", "{arguments}.0", 400, ["isError"], ["user"]] // response, body, statusCode, truthy, falsy, hasCurrentUser
                        }
                    ]
                },
                {
                    name: "Testing verifying a user with a bogus verification code...",
                    type: "test",
                    sequence: [
                        {
                            func: "{bogusVerificationRequest}.send",
                            args: [{}, { headers: { "Accept": "application/json" }}]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{bogusVerificationRequest}.events.onComplete",
                            args:     ["{bogusVerificationRequest}.nativeResponse", "{arguments}.0", 401, ["isError"], ["user"]]
                        }
                    ]
                },
                {
                    name: "Testing resending a verification code for an unverified user...",
                    type: "test",
                    sequence: [
                        {
                            func: "{resendVerification}.send",
                            args: [ { email: "unverified@localhost"} ]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.checkEnvironmentForVerificationCode",
                            event:    "{testEnvironment}.smtp.mailServer.events.onMessageReceived",
                            args:     ["{testEnvironment}"]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{resendVerification}.events.onComplete",
                            args:     ["{resendVerification}.nativeResponse", "{arguments}.0", 200]
                        }
                    ]
                },
                {
                    name: "Testing resending a verification code for a verified user (HTTP response)...",
                    type: "test",
                    sequence: [
                        {
                            func: "{resendVerificationForVerifiedUser}.send",
                            args: [ { email: "existing@localhost"} ]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{resendVerificationForVerifiedUser}.events.onComplete",
                            args:     ["{resendVerificationForVerifiedUser}.nativeResponse", "{arguments}.0", 200]
                        }
                    ]
                },
                {
                    name: "Testing resending a verification code for a bogus user (HTTP response)...",
                    type: "test",
                    sequence: [
                        {
                            func: "{resendVerificationForBogusUser}.send",
                            args: [ { email: "bogus@localhost"} ]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{resendVerificationForBogusUser}.events.onComplete",
                            args:     ["{resendVerificationForBogusUser}.nativeResponse", "{arguments}.0", 404]
                        }
                    ]
                },
                {
                    name: "Testing creating a user, end-to-end...",
                    type: "test",
                    sequence: [
                        {
                            func: "{fullSignupInitialRequest}.send",
                            args: [ "{fullSignupInitialRequest}.options.user" ]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.fullSignupVerifyEmail",
                            event:    "{testEnvironment}.smtp.events.onMessageReceived",
                            args:     ["{fullSignupInitialRequest}", "{fullSignupVerifyVerificationRequest}", "{testEnvironment}"]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{fullSignupInitialRequest}.events.onComplete",
                            args:     ["{fullSignupInitialRequest}.nativeResponse", "{arguments}.0", 200]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{fullSignupVerifyVerificationRequest}.events.onComplete",
                            args:     ["{fullSignupVerifyVerificationRequest}.nativeResponse", "{arguments}.0", 200, ["message"]]
                        },
                        {
                            func: "{fullSignupLoginRequest}.send",
                            args: [{ username: "{fullSignupInitialRequest}.options.user.username", password: "{fullSignupInitialRequest}.options.user.password" }]
                        },
                        {
                            listener: "fluid.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{fullSignupLoginRequest}.events.onComplete",
                            args:     ["{fullSignupLoginRequest}.nativeResponse", "{arguments}.0", 200]
                        }
                    ]
                }
            ]
        }
    ]
});


fluid.defaults("fluid.tests.express.user.signup.environment", {
    gradeNames: ["fluid.test.express.user.environment"],
    port:       8778,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "fluid.tests.express.user.signup.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.express.user.signup.environment");
