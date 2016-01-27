// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between this and the server-tests.js, a test that fails in both is likely broken on the server
// side, a test that only fails here is likely broken in the client-facing code.

// TODO: Test signup form with various errors.
// Password length errors and messages regarding duplicate users are not displayed correctly.
// This should be done once `gpii-json-schema` is a bit better discussed.

"use strict";
var fluid         = require("infusion");
var gpii          = fluid.registerNamespace("gpii");

require("../lib/");

//gpii.express.user.tests.signup.client.startSignupFromBrowser = function (harness) {
//    var browser = new Browser();
//
//    var timestamp = Date.now();
//    var username  = "user-" + timestamp;
//    var password  = "Pass-" + timestamp;
//    var email     = "email-" + timestamp + "@localhost";
//
//    // Save the sample user so that we can test the login later in the process.
//    harness.user = {
//        username: username,
//        password: password
//    };
//
//    jqUnit.stop();
//    browser.visit(harness.options.baseUrl + "api/user/signup").then(function () {
//        jqUnit.start();
//        gpii.express.user.api.tests.isBrowserSane(jqUnit, browser);
//
//        jqUnit.stop();
//        browser
//            .fill("username", username)
//            .fill("password", password)
//            .fill("confirm",  password)
//            .fill("email", email)
//            .pressButton("Sign Up", function () {
//                jqUnit.start();
//                gpii.express.user.api.tests.isBrowserSane(jqUnit, browser);
//
//                // The signup form should not be visible
//                var signupForm = browser.window.$(".signup-form");
//                jqUnit.assertNotUndefined("There should be a signup form...", signupForm.html());
//                jqUnit.assertEquals("The signup form should be hidden...", "none", signupForm.css("display"));
//
//                // A "success" message should be visible
//                var feedback = browser.window.$(".success");
//                jqUnit.assertNotUndefined("There should be a positive feedback message...", feedback.html());
//
//                // There should be no alerts
//                var alert = browser.window.$(".alert");
//                jqUnit.assertUndefined("There should not be an alert...", alert.html());
//            });
//    });
//};
//
//gpii.express.user.tests.signup.client.continueSignupFromEmail = function (harness) {
//    var MailParser = require("mailparser").MailParser,
//        mailparser = new MailParser();
//
//    // If this ends up going any deeper, we should refactor to use a testEnvironment and testCaseHolder
//    mailparser.on("end", function (mailObject) {
//        jqUnit.start();
//        var content = mailObject.text;
//
//        // Get the reset code and continue the reset process
//        var verifyCodeRegexp = new RegExp("(http.+verify/[a-z0-9-]+)", "i");
//        var matches = content.toString().match(verifyCodeRegexp);
//
//        jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", matches);
//        if (matches) {
//            var verifyUrl = matches[1];
//            jqUnit.stop();
//
//            // We need a separate browser to avoid clobbering the instance used to generate this email, which still needs to check the results of its activity.
//            var verifyBrowser = new Browser();
//            verifyBrowser.visit(verifyUrl).then(function () {
//                jqUnit.start();
//                gpii.express.user.api.tests.isBrowserSane(jqUnit, verifyBrowser);
//
//                // A "success" message should be visible
//                var feedback = verifyBrowser.window.$(".success");
//                jqUnit.assertNotUndefined("There should be a positive feedback message...", feedback.html());
//
//                // There should be no alerts
//                var alert = verifyBrowser.window.$(".alert");
//                jqUnit.assertUndefined("There should not be an alert...", alert.html());
//
//                // Log in using the new account
//                jqUnit.stop();
//                verifyBrowser.visit(harness.options.baseUrl + "api/user/login").then(function () {
//                    jqUnit.start();
//                    gpii.express.user.api.tests.isBrowserSane(jqUnit, verifyBrowser);
//                    jqUnit.stop();
//
//                    verifyBrowser.fill("username", harness.user.username)
//                        .fill("password", harness.user.password)
//                        .pressButton("Log In", function () {
//                            jqUnit.start();
//                            gpii.express.user.api.tests.isBrowserSane(jqUnit, verifyBrowser);
//
//                            // The login form should no longer be visible
//                            var loginForm = verifyBrowser.window.$(".login-form");
//                            jqUnit.assertNotUndefined("There should be a login form...", loginForm.html());
//                            jqUnit.assertEquals("The login form should not be hidden...", "none", loginForm.css("display"));
//
//                            // A "success" message should be visible
//                            var feedback = verifyBrowser.window.$(".login-success");
//                            jqUnit.assertNotUndefined("There should be a positive feedback message...", feedback.html());
//
//                            // There should be no alerts
//                            var alert = verifyBrowser.window.$(".login-error");
//                            jqUnit.assertEquals("There should not be any alerts...", 0, alert.html().length);
//
//                            // Make sure the test harness waits for us to actually be finished.
//                            harness.events.onReadyToDie.fire();
//                        });
//                });
//            });
//        }
//    });
//
//    // send the email source to the parser
//    jqUnit.stop();
//    var content = fs.readFileSync(harness.smtp.mailServer.currentMessageFile);
//    mailparser.write(content);
//    mailparser.end();
//};

fluid.defaults("gpii.express.user.tests.signup.client.caseHolder", {
    gradeNames: ["gpii.express.user.tests.caseHolder"],
    rawModules: [
        {
            tests: [
                //{
                //    name: "Try to create a user with the same email address as an existing user...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.browser.goto",
                //            args: ["{testEnvironment}.options.signupUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onLoaded",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='username']", "duplicate"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='email']", "existing@localhost"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='password']", "Password1!"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='confirm']", "Password1!"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.click",
                //            args:     [".signup-submit"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onClickComplete",
                //            listener: "{testEnvironment}.browser.wait",
                //            args:     ["{testEnvironment}.options.ajaxWait"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onWaitComplete",
                //            listener: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.elementMatches, ".signup-error", "A user with this email or username already exists."]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertTrue",
                //            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                //        },
                //        {
                //            func: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.lookupFunction, ".signup-success", "innerHTML"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertNull",
                //            args:     ["A success message should not be displayed...", "{arguments}.0"]
                //        }
                //    ]
                //},
                //{
                //    name: "Try to create a user with the same username as an existing user...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.browser.goto",
                //            args: ["{testEnvironment}.options.signupUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onLoaded",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='username']", "existing"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='email']", "new.email@localhost"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='password']", "Password1!"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='confirm']", "Password1!"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.click",
                //            args:     [".signup-submit"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onClickComplete",
                //            listener: "{testEnvironment}.browser.wait",
                //            args:     ["{testEnvironment}.options.ajaxWait"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onWaitComplete",
                //            listener: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.elementMatches, ".signup-error", "A user with this email or username already exists."]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertTrue",
                //            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                //        },
                //        {
                //            func: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.lookupFunction, ".signup-success", "innerHTML"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertNull",
                //            args:     ["A success message should not be displayed...", "{arguments}.0"]
                //        }
                //    ]
                //},
                //{
                //    name: "Try to create a user with mismatching passwords...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.browser.goto",
                //            args: ["{testEnvironment}.options.signupUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onLoaded",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='username']", "newbie"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='email']", "newbie@localhost"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='password']", "Password1!"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.type",
                //            args:     ["[name='confirm']", "Password2!"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onTypeComplete",
                //            listener: "{testEnvironment}.browser.click",
                //            args:     [".signup-submit"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onClickComplete",
                //            listener: "{testEnvironment}.browser.wait",
                //            args:     ["{testEnvironment}.options.ajaxWait"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onWaitComplete",
                //            listener: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.elementMatches, ".signup-error", "The passwords you have entered don't match."]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertTrue",
                //            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                //        },
                //        {
                //            func: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.lookupFunction, ".signup-success", "innerHTML"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertNull",
                //            args:     ["A success message should not be displayed...", "{arguments}.0"]
                //        }
                //    ]
                //},
                //{
                //    name: "Try to use an invalid verification code...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.browser.goto",
                //            args: ["{testEnvironment}.options.bogusVerifyUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onLoaded",
                //            listener: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.elementMatches, ".alert", "You must provide a valid verification code to use this interface."]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertTrue",
                //            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                //        },
                //        {
                //            func: "{testEnvironment}.browser.evaluate",
                //            args: [gpii.tests.browser.tests.lookupFunction, ".verify-form", "innerHTML"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                //            listener: "jqUnit.assertNull",
                //            args:     ["The verification form should not be displayed...", "{arguments}.0"]
                //        }
                //    ]
                //},

                // TODO:  Convert this
                {
                    name: "Create and verify a new user from end to end...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.signupUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='username']", "newbie"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='email']", "newbie@localhost"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "Password1!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='confirm']", "Password1!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".signup-submit"]
                        },
                        // We should have successfully submitted our form and should be able to continue from email.
                        {
                            listener: "gpii.express.user.tests.client.continueFromEmail",
                            event:    "{testEnvironment}.harness.smtp.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{testEnvironment}.options.verifyPattern"]
                        },
                        // The function above will cause the browser to `goto` our custom "verify" URL.
                        // We wait for this to load, and confirm that our account has been created by logging in.
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.goto",
                            args:     ["{testEnvironment}.options.loginUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='username']", "newbie"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "Password1!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".login-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.ajaxWait"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args:     [gpii.tests.browser.tests.elementMatches, ".login-success", "You have successfully logged in."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A login success message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".login-failure", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A login failure message should not be displayed...", "{arguments}.0"]
                        }
                    ]
                }
            ]
        }
    ]
});

gpii.express.user.tests.environment({
    apiPort:   7532,
    pouchPort: 7542,
    mailPort:  4089,
    ajaxWait: 500,
    verifyPattern: "(http.+verify/[a-z0-9-]+)",
    bogusVerifyUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "verify/utterNonsense"}]
        }
    },
    signupUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "signup"}]
        }
    },
    loginUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "login"}]
        }
    },
    components: {
        testCaseHolder: {
            type: "gpii.express.user.tests.signup.client.caseHolder"
        },
        harness: {
            options: {
                events: {
                    onReadyToDie: null
                }
            }
        }
    }
});

