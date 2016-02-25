// Test the "forgot password" reset mechanism end-to-end.
//
"use strict";
var fluid      = require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("../lib/");

require("gpii-test-browser");
gpii.tests.browser.loadTestingSupport();

fluid.defaults("gpii.express.user.tests.forgot.client.caseHolder", {
    gradeNames: ["gpii.express.user.tests.caseHolder"],
    rawModules: [
        {
            tests: [
                {
                    name: "Confirm that passwords must match...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.forgotUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='email']", "existing@localhost"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".forgot-button"]
                        },
                        {
                            listener: "gpii.express.user.tests.client.continueFromEmail",
                            event:    "{testEnvironment}.harness.smtp.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{testEnvironment}.options.resetPattern"]
                        },
                        // The function above will cause the browser to `goto` our custom "reset" URL.
                        // We wait for this to load, and fill in the form.
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "NewPass12345!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='confirm']", "NewPass54321!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.waitTimeout"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".reset-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.ajaxWait"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args:     [gpii.tests.browser.tests.elementMatches, ".fieldError", "The 'confirm' field must match the 'password' field."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A reset failure message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".reset-success", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A reset success message should not be displayed...", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Try to reset the password for a user who doesn't exist...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.forgotUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='email']", "nowhere.man@localhost"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.waitTimeout"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".forgot-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.ajaxWait"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args:     [gpii.tests.browser.tests.elementMatches, ".forgot-error .alert", "No matching user found."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".forgot-success", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A success message should not be displayed...", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Try to use an invalid reset code...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.bogusResetUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
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
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.waitTimeout"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".reset-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.ajaxWait"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args:     [gpii.tests.browser.tests.elementMatches, ".reset-error .alert", "You must provide a valid reset code to use this interface."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".reset-success", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A success message should not be displayed...", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Reset a user's password from end-to-end using the \"forgot password\" form...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.forgotUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='email']", "existing@localhost"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".forgot-button"]
                        },
                        {
                            listener: "gpii.express.user.tests.client.continueFromEmail",
                            event:    "{testEnvironment}.harness.smtp.events.onMessageReceived",
                            args:     ["{testEnvironment}", "{testEnvironment}.options.resetPattern"]
                        },
                        // The function above will cause the browser to `goto` our custom "reset" URL.
                        // We wait for this to load, and fill in the form.
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "NewPass12345!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='confirm']", "NewPass12345!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.waitTimeout"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.click",
                            args:     [".reset-button"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onClickComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.ajaxWait"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
                            listener: "{testEnvironment}.browser.evaluate",
                            args:     [gpii.tests.browser.tests.elementMatches, ".reset-success", "Your password has been reset."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A reset success message should now be displayed...", "{arguments}.0"]
                        },
                        {
                            func: "{testEnvironment}.browser.evaluate",
                            args: [gpii.tests.browser.tests.lookupFunction, ".reset-failure", "innerHTML"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertNull",
                            args:     ["A reset failure message should not be displayed...", "{arguments}.0"]
                        },
                        // Now, confirm that our password has actually been reset by using it to log in.
                        {
                            func: "{testEnvironment}.browser.goto",
                            args: ["{testEnvironment}.options.loginUrl"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onLoaded",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='username']", "existing@localhost"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.type",
                            args:     ["[name='password']", "NewPass12345!"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onTypeComplete",
                            listener: "{testEnvironment}.browser.wait",
                            args:     ["{testEnvironment}.options.waitTimeout"]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onWaitComplete",
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
    apiPort:   7533,
    pouchPort: 7534,
    mailPort:  4082,
    ajaxWait:  500, // The standard time we give our AJAX calls to complete
    resetPattern: "(http.+reset/[a-z0-9-]+)",
    forgotUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "forgot"}]
        }
    },
    loginUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "login"}]
        }
    },
    bogusResetUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%path", { baseUrl: "{testEnvironment}.options.baseUrl", path: "reset/foobar"}]
        }
    },
    components: {
        testCaseHolder: {
            type: "gpii.express.user.tests.forgot.client.caseHolder"
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
