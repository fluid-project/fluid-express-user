// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between this and the server-tests.js, a test that fails in both is likely broken on the server
// side, a test that only fails here is likely broken in the client-facing code.
//
/* eslint-env node */
"use strict";
var fluid         = require("infusion");
var gpii          = fluid.registerNamespace("gpii");

require("../lib/");

fluid.defaults("gpii.tests.express.user.signup.client.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    rawModules: [
        {
            name: "Testing self signup functions with a test browser...",
            tests: [
                // TODO: Figure out why we can only run one test per suite without listener cleanup errors.
                //{
                //    name: "Try to create a user with the same email address as an existing user...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.webdriver.get",
                //            args: ["{testEnvironment}.options.signupUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-form"})]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                //            listener: "{testEnvironment}.webdriver.actionsHelper",
                //            args:     [[{fn: "sendKeys", args: [
                //                gpii.webdriver.Key.TAB, "duplicate",
                //                gpii.webdriver.Key.TAB, "existing@localhost",
                //                gpii.webdriver.Key.TAB, "Password1!",
                //                gpii.webdriver.Key.TAB, "Password1!",
                //                gpii.webdriver.Key.ENTER
                //            ]}]]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-error .alert"})]
                //        },
                //        {
                //            func: "{testEnvironment}.webdriver.findElement",
                //            args: [{ css: ".signup-error .alert"}]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args:     ["A signup failure message should be displayed...", "{arguments}.0", "getText", "A user with this email or username already exists."] // message, element, elementFn, expectedValue, jqUnitFn
                //        },
                //        {
                //            func: "{testEnvironment}.webdriver.findElement",
                //            args: [{ css: ".signup-success"}]
                //        },
                //        {
                //            event: "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args: ["A success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                //        }
                //    ]
                //},
                //{
                //    name: "Try to create a user with the same username as an existing user...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.webdriver.get",
                //            args: ["{testEnvironment}.options.signupUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-form"})]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                //            listener: "{testEnvironment}.webdriver.actionsHelper",
                //            args:     [[{fn: "sendKeys", args: [
                //                gpii.webdriver.Key.TAB, "existing",
                //                gpii.webdriver.Key.TAB, "new.email@localhost",
                //                gpii.webdriver.Key.TAB, "Password1!",
                //                gpii.webdriver.Key.TAB, "Password1!",
                //                gpii.webdriver.Key.ENTER
                //            ]}]]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-error .alert"})]
                //        },
                //        {
                //            func: "{testEnvironment}.webdriver.findElement",
                //            args: [{ css: ".signup-error .alert"}]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args:     ["A signup failure message should be displayed...", "{arguments}.0", "getText", "A user with this email or username already exists."] // message, element, elementFn, expectedValue, jqUnitFn
                //        },
                //        {
                //            func: "{testEnvironment}.webdriver.findElement",
                //            args: [{ css: ".signup-success"}]
                //        },
                //        {
                //            event: "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args: ["A success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                //        }
                //    ]
                //},
                //{
                //    name: "Try to create a user with mismatching passwords...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.webdriver.get",
                //            args: ["{testEnvironment}.options.signupUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-form"})]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                //            listener: "{testEnvironment}.webdriver.actionsHelper",
                //            args:     [[{fn: "sendKeys", args: [
                //                gpii.webdriver.Key.TAB, "newbie",
                //                gpii.webdriver.Key.TAB, "newbie@localhost",
                //                gpii.webdriver.Key.TAB, "Password1!",
                //                gpii.webdriver.Key.TAB, "Password2!",
                //                gpii.webdriver.Key.ENTER
                //            ]}]]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-error .alert"})]
                //        },
                //        {
                //            func: "{testEnvironment}.webdriver.findElement",
                //            args: [{ css: ".signup-error"}]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args:     ["A signup failure message should be displayed...", "{arguments}.0", "getText", "Your password and confirmation password do not match."] // message, element, elementFn, expectedValue, jqUnitFn
                //        },
                //        {
                //            func: "{testEnvironment}.webdriver.findElement",
                //            args: [{ css: ".signup-success"}]
                //        },
                //        {
                //            event: "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args: ["A success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                //        }
                //    ]
                //},
                //{
                //    name: "Try to use an invalid verification code...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.webdriver.get",
                //            args: ["{testEnvironment}.options.bogusVerifyUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                //            listener: "{testEnvironment}.webdriver.wait",
                //            args:     [gpii.webdriver.until.elementLocated({ css: ".alert"})]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                //            listener: "{testEnvironment}.webdriver.findElement",
                //            args:     [{ css: ".alert"}]
                //        },
                //        {
                //            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                //            listener: "gpii.test.webdriver.inspectElement",
                //            args:     ["A verification failure message should be displayed...", "{arguments}.0", "getText", "You must provide a valid verification code to use this interface."] // message, element, elementFn, expectedValue, jqUnitFn
                //        }
                //    ]
                //},
                {
                    name: "Create and verify a new user from end to end...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.webdriver.get",
                            args: ["{testEnvironment}.options.signupUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".signup-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [
                                gpii.webdriver.Key.TAB, "newbie",
                                gpii.webdriver.Key.TAB, "newbie@localhost",
                                gpii.webdriver.Key.TAB, "Password1!",
                                gpii.webdriver.Key.TAB, "Password1!",
                                gpii.webdriver.Key.ENTER
                            ]}]]
                        },
                        // We should have successfully submitted our form and should be able to continue from email.
                        {
                            listener: "gpii.test.express.user.client.continueFromEmail",
                            event:    "{testEnvironment}.smtp.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{testEnvironment}.options.verifyPattern"]
                        },
                        // The function above will cause the browser to `goto` our custom "verify" URL.
                        // We wait for this to load, and confirm that our account has been created by logging in.
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.get",
                            args:     ["{testEnvironment}.options.loginUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".login-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "newbie", gpii.webdriver.Key.TAB, "Password1!", gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".login-success .success"})]
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".login-success .success"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A login success message should now be displayed...", "{arguments}.0", "getText", "You have successfully logged in."] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.signup.client.environment", {
    gradeNames: ["gpii.test.express.user.environment.withBrowser"],
    port:       7532,
    mailPort:   4089,
    verifyPattern: "(http.+verify/[a-z0-9-]+)",
    bogusVerifyUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/verify/utterNonsense"}]
        }
    },
    signupUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/signup"}]
        }
    },
    loginUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/login"}]
        }
    },
    components: {
        testCaseHolder: {
            type: "gpii.tests.express.user.signup.client.caseHolder"
        }
    }
});

//gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.express.user.signup.client.environment" });
gpii.tests.express.user.signup.client.environment();
