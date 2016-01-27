// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between this and the server-tests.js, a test that fails in both is likely broken on the server
// side, a test that only fails here is likely broken in the client-facing code.
//
"use strict";
var fluid      = require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("../lib/");

require("gpii-test-browser");
gpii.tests.browser.loadTestingSupport();

fluid.defaults("gpii.express.user.tests.login.client.caseHolder", {
    gradeNames: ["gpii.express.user.tests.caseHolder"],
    rawModules: [
        {
            tests: [
                {
                    name: "Login with a valid username and password...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.loginUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='username']", "existing"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "password"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".login-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     [500] // TODO: Try reducing or eliminating this
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args:     [gpii.tests.browser.tests.elementMatches, ".login-success", "You have successfully logged in."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A success message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".login-error", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A failure message should not be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.visible",
                            args: [".login-form"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onVisibleComplete",
                            listener: "jqUnit.assertFalse",
                            args:     ["The login form should no longer be visible...", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Login with an invalid username and password...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.loginUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='username']", "bogus"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "bogus"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".login-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     [500] // TODO: Try reducing or eliminating this
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.elementMatches, ".login-error .alert", "Invalid username or password."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".login-success", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A success message should not be displayed...", "{arguments}.0"]
                        }
                    ]
                }
            ]
        }
    ]
});

gpii.express.user.tests.environment({
    apiPort:   7542,
    pouchPort: 7524,
    mailPort:  4099,
    loginUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "login"}]
        }
    },
    components: {
        testCaseHolder: {
            type: "gpii.express.user.tests.login.client.caseHolder"
        }
    }
});

