/*

    The password reset process has two steps.  These tests exercise both steps independently and together.

 */
"use strict";

var fluid        = require("infusion");
var gpii         = fluid.registerNamespace("gpii");

require("../lib/");

var jqUnit       = require("node-jqunit");
var fs           = require("fs");

fluid.registerNamespace("gpii.tests.express.user.reset.caseHolder");

// Listen for the email with the reset code and launch the reset request
gpii.tests.express.user.reset.caseHolder.fullResetVerifyEmail = function (verificationRequest, testEnvironment) {
    gpii.tests.express.user.reset.caseHolder.extractResetCode(testEnvironment).then(gpii.express.user.signup.test.caseHolder.checkResetCode).then(function (code) {
        verificationRequest.options.path = fluid.stringTemplate(verificationRequest.options.path, { code: code });
        verificationRequest.send({}, { headers: { "Accept": "application/json" }});
    });
};

gpii.tests.express.user.reset.caseHolder.checkResetCode = function (code) {
    jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", code);
    return code;
};

gpii.tests.express.user.reset.caseHolder.checkEnvironmentForResetCode = function (testEnvironment) {
    gpii.tests.express.user.reset.caseHolder.extractResetCode(testEnvironment).then(gpii.tests.express.user.reset.caseHolder.checkResetCode);
};

gpii.tests.express.user.reset.caseHolder.extractResetCode = function (testEnvironment) {
    return gpii.test.express.user.extractCode(testEnvironment, "https?://[^/]+/api/user/reset/([a-z0-9-]+)");
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.tests.express.user.reset.caseHolder", {
    gradeNames: ["gpii.test.express.user.caseHolder"],
    testUser: {
        username: "existing",
        email:    "existing@localhost",
        password: "Password1"
    },
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        loginRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/login",
                method:   "POST"
            }
        },
        bogusResetRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/reset/NONSENSE",
                method:   "POST"
            }
        },
        fullResetForgotRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/forgot",
                method:   "POST"
            }
        },
        fullResetVerifyResetRequest: {
            type: "gpii.test.express.user.request",
            options: {
                user: "{caseHolder}.options.testUser",
                endpoint: "api/user/reset/%code",
                method:   "POST"
            }
        },
        fullResetLoginRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/login",
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
                            args: [{ code: "utter-nonsense-which-should-never-work", password: "Something123" }]
                        },
                        {
                            listener: "gpii.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{bogusResetRequest}.events.onComplete",
                            args: ["{bogusResetRequest}.nativeResponse", "{arguments}.0", 400, null, ["ok"]]
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
                        //    listener: "gpii.tests.express.user.reset.caseHolder.verifyResponse",
                        //    event: "{fullResetForgotRequest}.events.onComplete",
                        //    args: ["{fullResetForgotRequest}", "{fullResetForgotRequest}.nativeResponse", "{arguments}.0", 200]
                        //},
                        {
                            listener: "gpii.tests.express.user.reset.caseHolder.fullResetVerifyEmail",
                            event:    "{testEnvironment}.harness.smtp.mailServer.events.onMessageReceived",
                            args:     ["{fullResetVerifyResetRequest}", "{testEnvironment}"]
                        },
                        {
                            listener: "gpii.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{fullResetVerifyResetRequest}.events.onComplete",
                            args: ["{fullResetVerifyResetRequest}.nativeResponse", "{arguments}.0", 200, ["ok"]]
                        },
                        {
                            func: "{fullResetLoginRequest}.send",
                            args: [{ username: "{that}.options.testUser.username", password: "{that}.options.testUser.password"}]
                        },
                        {
                            listener: "gpii.tests.express.user.reset.caseHolder.verifyResponse",
                            event: "{fullResetLoginRequest}.events.onComplete",
                            args: ["{fullResetLoginRequest}.nativeResponse", "{arguments}.0", 200, ["ok", "user"]]
                        }
                    ]
                }
            ]
        }
    ]
});


gpii.tests.express.user.reset.caseHolder.verifyResponse = function (response, body, statusCode, truthy, falsy, hasCurrentUser) {
    if (!statusCode) { statusCode = 200; }
    gpii.test.express.helpers.isSaneResponse(response, body, statusCode);

    var data = typeof body === "string" ? JSON.parse(body): body;

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
gpii.tests.express.user.reset.caseHolder.fullResetVerifyEmail = function (resetRequest, testEnvironment) {
    var content = fs.readFileSync(testEnvironment.harness.smtp.mailServer.currentMessageFile);

    var MailParser = require("mailparser").MailParser,
        mailparser = new MailParser({ debug: false });

    // If this gets any deeper, refactor to use a separate function
    mailparser.on("end", function (mailObject) {
        var content = mailObject.text;
        var resetCodeRegexp = new RegExp("https?://[^/]+/api/user/reset/([a-z0-9-]+)", "i");
        var matches = content.toString().match(resetCodeRegexp);

        jqUnit.assertNotNull("There should be a reset code in the email sent to the user.", matches);

        if (matches) {
            var code = matches[1];
            resetRequest.options.path = fluid.stringTemplate(resetRequest.options.path, { code: code});

            resetRequest.send({ password: resetRequest.options.user.password, confirm: resetRequest.options.user.password});
        }
    });

    mailparser.write(content);
    mailparser.end();
};

fluid.defaults("gpii.tests.express.user.reset.environment", {
    gradeNames: ["gpii.test.express.user.environment"],
    apiPort:   8779,
    pouchPort: 8765,
    mailPort:  8825,
    components: {
        caseHolder: {
            type: "gpii.tests.express.user.reset.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.express.user.reset.environment");