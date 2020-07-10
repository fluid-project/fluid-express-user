// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between this and the server-tests.js, a test that fails in both is likely broken on the server
// side, a test that only fails here is likely broken in the client-facing code.
//
/* eslint-env node */
"use strict";
var fluid      = require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("../lib/");

fluid.defaults("gpii.tests.express.user.login.client.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    rawModules: [
        {
            name: "Testing login functions with a test browser...",
            tests: [
                {
                    name: "Login with a valid username and password and then log out...",
                    type: "test",
                    sequence: [
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
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "existing", gpii.webdriver.Key.TAB, "password", gpii.webdriver.Key.ENTER]}]]
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
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".login-form"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["The login form should no longer be visible...", "{arguments}.0", "isDisplayed", false] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".user-controls-toggle"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["The username should now be displayed.", "{arguments}.0", "getText", "existing"] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.actionsHelper",
                            args: [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, gpii.webdriver.Key.ENTER, gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".login-form"})]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                            listener: "{testEnvironment}.webdriver.findElement",
                            args:     [{ css: ".login-form"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["The login form should be visible again...", "{arguments}.0", "isDisplayed", true] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".user-controls-toggle"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["The user controls should no longer indicate that the user is logged in.", "{arguments}.0", "getText", "Not Logged In"] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                },
                {
                    name: "Login with an invalid username and password...",
                    type: "test",
                    sequence: [
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
                            args:     [[{fn: "sendKeys", args: [gpii.webdriver.Key.TAB, "bogusUsername", gpii.webdriver.Key.TAB, "bogusPassword", gpii.webdriver.Key.ENTER]}]]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                            listener: "{testEnvironment}.webdriver.wait",
                            args:     [gpii.webdriver.until.elementLocated({ css: ".login-error .alert"})]
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".login-error .alert"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A login failure message should be displayed...", "{arguments}.0", "getText", "Invalid username or password."] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".login-success"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["A login success message should not be displayed...", "{arguments}.0", "getText", ""] // message, element, elementFn, expectedValue, jqUnitFn
                        },
                        {
                            func: "{testEnvironment}.webdriver.findElement",
                            args: [{ css: ".login-form"}]
                        },
                        {
                            event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                            listener: "gpii.test.webdriver.inspectElement",
                            args:     ["The login form should still be visible...", "{arguments}.0", "isDisplayed", true] // message, element, elementFn, expectedValue, jqUnitFn
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.login.client.environment", {
    gradeNames: ["gpii.test.express.user.environment.withBrowser"],
    port:       7542,
    mailPort:   4099,
    loginUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "api/user/login"}]
        }
    },
    components: {
        testCaseHolder: {
            type: "gpii.tests.express.user.login.client.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.express.user.login.client.environment"});
