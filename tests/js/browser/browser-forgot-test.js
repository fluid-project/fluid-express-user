// Test the "forgot password" reset mechanism end-to-end.
//
/* eslint-env node */
"use strict";
var fluid      = require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("../lib/");

require("gpii-webdriver");
gpii.webdriver.loadTestingSupport();

fluid.defaults("gpii.tests.express.user.forgot.client.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    rawModules: [
        {
            name: "Testing password reset functions with a test browser...",
            tests: [
                {
                    name: "Confirm that passwords must match...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.webdriver.get",
                            args: ["{testEnvironment}.options.forgotUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".forgot-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "existing@localhost", gpii.webdriver.Key.TAB, gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            event:    "{testEnvironment}.smtp.events.onMessageReceived",
                            listener: "gpii.test.express.user.client.continueFromEmail",
                            args:     ["{testEnvironment}", "{testEnvironment}.options.resetPattern"]
                        },
                        // The function above will cause the browser to `goto` our custom "reset" URL.
                        // We wait for this to load, and fill in the form.
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".reset-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "NewPass12345!", gpii.webdriver.Key.TAB, "DifferentPass12345!", gpii.webdriver.Key.ENTER]}]]
                        },
                        // Now that the schema validated model component's initial pass occurs later, we need to wait
                        // before we check for a validation error.
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.sleep",
                            args:     [250]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onSleepComplete",
                            listener: "{testEnvironment}.webdriver.findElement",
                            args:     [{ css: ".reset-error"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A reset failure message should now be displayed...", "{arguments}.0", "getText", "Your password and confirmation password do not match."] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".reset-success"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A reset success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                },
                {
                    name: "Try to reset the password for a user who doesn't exist...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.webdriver.get",
                            args: ["{testEnvironment}.options.forgotUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".forgot-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "nowhere.man@localhost", gpii.webdriver.Key.TAB, gpii.webdriver.Key.ENTER]}]]
                        },
                        // The error message is displayed just slowly enough that we will miss it if we try to find it immediately.
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".forgot-error .alert"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.findElement",
                            args:     [{ css: ".forgot-error .alert"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A reset failure message should now be displayed...", "{arguments}.0", "getText", "No matching user found."] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".forgot-success"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                },
                {
                    name: "Try to use an invalid reset code...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.webdriver.get",
                            args: ["{testEnvironment}.options.bogusResetUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".reset-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "Password1!", gpii.webdriver.Key.TAB, "Password1!", gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".reset-error .alert"})]
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".reset-error .alert"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A failure message should be displayed...", "{arguments}.0", "getText", "You must provide a valid reset code to use this interface."] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".reset-success"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                },
                {
                    name: "Reset a user's password from end-to-end using the \"forgot password\" form...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.webdriver.get",
                            args: ["{testEnvironment}.options.forgotUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".forgot-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "existing@localhost", gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            listener: "gpii.test.express.user.client.continueFromEmail",
                            event:    "{testEnvironment}.smtp.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{testEnvironment}.options.resetPattern"]
                        },
                        // The function above will cause the browser to `goto` our custom "reset" URL.
                        // We wait for this to load, and fill in the form.
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".reset-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "NewPass12345!", gpii.webdriver.Key.TAB, "NewPass12345!", gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".reset-success .success"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.findElement",
                            args:     [{ css: ".reset-success .success"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A reset success message should now be displayed...", "{arguments}.0", "getText", "Your password has been reset."] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".reset-error"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A reset failure message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        // Now, confirm that our password has actually been reset by using it to log in.
                        {
                            func: "{testEnvironment}.webdriver.get",
                            args: ["{testEnvironment}.options.loginUrl"]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onGetComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".login-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.actionsHelper",
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "existing", gpii.webdriver.Key.TAB, "NewPass12345!", gpii.webdriver.Key.ENTER]}]]
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
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".login-error"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A login failure message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.forgot.client.environment", {
    gradeNames: ["gpii.test.express.user.environment.withBrowser"],
    resetPattern: "(http.+reset/[a-z0-9-]+)",
    port: 7533,
    mailPort:  4082,
    forgotUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/forgot"}]
        }
    },
    loginUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/login"}]
        }
    },
    bogusResetUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/reset/foobar"}]
        }
    },
    components: {
        testCaseHolder: {
            type: "gpii.tests.express.user.forgot.client.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.express.user.forgot.client.environment"});
