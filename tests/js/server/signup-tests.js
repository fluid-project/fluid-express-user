/*

    The user self-signup is a two step process.  These tests exercise both steps independently and together.

 */
/* eslint-env node */
"use strict";

var fluid        = require("infusion");
var gpii         = fluid.registerNamespace("gpii");

require("../lib/");

var jqUnit = require("node-jqunit");

fluid.registerNamespace("gpii.tests.express.user.signup.caseHolder");

gpii.tests.express.user.signup.caseHolder.verifyResponse = function (response, body, statusCode, truthy, falsy, hasCurrentUser) {
    if (!statusCode) { statusCode = 200; }
    gpii.test.express.helpers.isSaneResponse(response, body, statusCode);

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
gpii.tests.express.user.signup.caseHolder.fullSignupVerifyEmail = function (signupRequest, verificationRequest, testEnvironment) {
    gpii.tests.express.user.signup.caseHolder.extractVerificationCode(testEnvironment).then(gpii.tests.express.user.signup.caseHolder.checkVerificationCode).then(function (code) {
        signupRequest.code = code;
        var path = "/api/user/verify/" + signupRequest.code;

        // I can't fix this with the model, so I have to override it completely
        verificationRequest.options.path = path;
        verificationRequest.send({}, { headers: { "Accept": "application/json" }});
    });
};

gpii.tests.express.user.signup.caseHolder.checkVerificationCode = function (code) {
    jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", code);

    return code;
};

gpii.tests.express.user.signup.caseHolder.checkEnvironmentForVerificationCode = function (testEnvironment) {
    gpii.tests.express.user.signup.caseHolder.extractVerificationCode(testEnvironment).then(gpii.tests.express.user.signup.caseHolder.checkVerificationCode);
};

gpii.tests.express.user.signup.caseHolder.extractVerificationCode = function (testEnvironment) {
    return gpii.test.express.user.extractCode(testEnvironment, "https?://[^/]+/api/user/verify/([a-z0-9-]+)");
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.tests.express.user.signup.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        duplicateUserCreateRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                method:   "POST"
            }
        },
        incompleteUserCreateRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                method:   "POST"
            }
        },
        bogusVerificationRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/verify/xxxxxxxxx",
                method: "GET"
            }
        },
        resendVerification: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/verify/resend",
                method: "POST"
            }
        },
        resendVerificationForVerifiedUser: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/verify/resend",
                method: "POST"
            }
        },
        resendVerificationForBogusUser: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/verify/resend",
                method: "POST"
            }
        },
        fullSignupInitialRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/signup",
                user: {
                    expander: {
                        funcName: "gpii.test.express.user.generateUser"
                    }
                },
                method: "POST"
            }
        },
        fullSignupVerifyVerificationRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                port: "{testEnvironment}.options.port",
                method: "GET"
            }
        },
        fullSignupLoginRequest: {
            type: "gpii.test.express.user.request",
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
                    name: "Testing creating an account with the same email address as an existing account...",
                    type: "test",
                    sequence: [
                        {
                            func: "{duplicateUserCreateRequest}.send",
                            args: [{ username: "new", password: "new", confirm: "new", email: "reset@localhost"}]
                        },
                        {
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{duplicateUserCreateRequest}.events.onComplete",
                            args:     ["{duplicateUserCreateRequest}.nativeResponse", "{arguments}.0", 400, null, ["ok", "user"]]
                        }
                    ]
                },
                {
                    name: "Testing creating an account without providing the required information...",
                    type: "test",
                    sequence: [
                        {
                            func: "{incompleteUserCreateRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{incompleteUserCreateRequest}.events.onComplete",
                            args:     ["{incompleteUserCreateRequest}.nativeResponse", "{arguments}.0", 400, null, ["ok", "user"]]
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
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{bogusVerificationRequest}.events.onComplete",
                            args:     ["{bogusVerificationRequest}.nativeResponse", "{arguments}.0", 401, null, ["ok", "user"]]
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
                            listener: "gpii.tests.express.user.signup.caseHolder.checkEnvironmentForVerificationCode",
                            event:    "{testEnvironment}.smtp.mailServer.events.onMessageReceived",
                            args:     ["{testEnvironment}"]
                        },
                        {
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
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
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
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
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
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
                            listener: "gpii.tests.express.user.signup.caseHolder.fullSignupVerifyEmail",
                            event:    "{testEnvironment}.smtp.events.onMessageReceived",
                            args:     ["{fullSignupInitialRequest}", "{fullSignupVerifyVerificationRequest}", "{testEnvironment}"]
                        },
                        {
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{fullSignupInitialRequest}.events.onComplete",
                            args:     ["{fullSignupInitialRequest}.nativeResponse", "{arguments}.0", 200]
                        },
                        {
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{fullSignupVerifyVerificationRequest}.events.onComplete",
                            args:     ["{fullSignupVerifyVerificationRequest}.nativeResponse", "{arguments}.0", 200, ["ok"]]
                        },
                        {
                            func: "{fullSignupLoginRequest}.send",
                            args: [{ username: "{fullSignupInitialRequest}.options.user.username", password: "{fullSignupInitialRequest}.options.user.password" }]
                        },
                        {
                            listener: "gpii.tests.express.user.signup.caseHolder.verifyResponse",
                            event:    "{fullSignupLoginRequest}.events.onComplete",
                            args:     ["{fullSignupLoginRequest}.nativeResponse", "{arguments}.0", 200]
                        }
                    ]
                }
            ]
        }
    ]
});


fluid.defaults("gpii.tests.express.user.signup.environment", {
    gradeNames: ["gpii.test.express.user.environment"],
    port:       8778,
    pouchPort:  8764,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "gpii.tests.express.user.signup.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.express.user.signup.environment");
