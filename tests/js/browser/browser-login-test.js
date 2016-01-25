// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between this and the server-tests.js, a test that fails in both is likely broken on the server
// side, a test that only fails here is likely broken in the client-facing code.
//
"use strict";
var fluid      = require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("../test-environment.js");

require("gpii-test-browser");
gpii.tests.browser.loadTestingSupport();

fluid.registerNamespace("gpii.express.user.tests.login.client");

//gpii.express.user.tests.login.client.loginWithValidUser = function (harness) {
//    browser.visit(harness.options.baseUrl + "api/user/login").then(function () {
//        gpii.express.user.api.tests.isBrowserSane(jqUnit, browser);
//
//        browser.fill("username", "existing")
//            .fill("password", "password")
//            .pressButton("Log In", function () {
//                gpii.express.user.api.tests.isBrowserSane(jqUnit, browser);
//
//                // The login form should no longer be visible
//                var loginForm = browser.window.$(".login-form");
//                jqUnit.assertNotUndefined("There should be a login form...", loginForm.html());
//                jqUnit.assertEquals("The login form should be hidden...", "none", loginForm.css("display"));
//
//                // A "success" message should be visible
//                var feedback = browser.window.$(".login-success");
//                jqUnit.assertTrue("There should be a positive feedback message...", feedback.html().length > 0);
//
//                // The profile should now have data
//                var toggle = browser.window.$(".user-controls-toggle");
//                var username = toggle.text().trim();
//                jqUnit.assertTrue("The profile username should not be undefined", username.indexOf("Not Logged In") === -1);
//
//                // There should be no alerts
//                var alert = browser.window.$(".alert");
//                jqUnit.assertUndefined("There should not be any alerts...", alert.html());
//                jqUnit.stop();
//
//                // Now try to log out using the profile controls
//                //
//                // We had to make jQuery fire the events (see below).
//                toggle.click();
//                browser.evaluate("$('.user-menu-logout').click()");
//
//                // We have to wait for the refresh to complete (the default wait period is 0.5 seconds)
//                browser.wait(function () {
//                    jqUnit.start();
//
//                    // The profile should no longer have data
//                    var toggleAfterLogout = browser.window.$(".user-controls-toggle");
//                    var usernameAfterLogout = toggleAfterLogout.text().trim();
//                    jqUnit.assertTrue("The profile username should not be set", usernameAfterLogout.indexOf("Not Logged In") !== -1);
//
//                    // Make sure the test harness waits for us to actually be finished.
//                    harness.events.onReadyToDie.fire();
//                });
//
//                // Zombie's `fire(eventName, selector, callback)` method does not appear to work at all, either as promises or as nested callbacks (see below)
//                //
//                // browser.fire("click", ".user-controls-toggle", function () {
//                //    browser.fire("click", ".user-menu-logout", function () {
//                //        jqUnit.start();
//                //        gpii.express.user.api.tests.isBrowserSane(jqUnit, browser);
//                //
//                //        // The profile should no longer have data
//                //        var toggle = browser.window.$(".user-controls-toggle");
//                //        var username = toggle.text().trim();
//                //        jqUnit.assertTrue("The profile username should not be set", username.indexOf("Not Logged In") !== -1);
//                //    });
//                //});
//            });
//    });
//};
//


fluid.defaults("gpii.express.user.tests.login.client.caseHolder", {
    gradeNames: ["gpii.tests.browser.caseHolder.withStandardStart"],
    sequenceEnd: [
        {
            func: "{testEnvironment}.harness.destroy"
        },
        {
            func: "{testEnvironment}.browser.end"
        },
        {
            listener: "fluid.identity",
            event: "{testEnvironment}.events.onAllDone"
        }
    ],
    rawModules: [
        {
            tests: [
                //{
                //    name: "Login with a valid username and password...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{testEnvironment}.browser.goto",
                //            args: ["{testEnvironment}.options.loginUrl"]
                //        },
                //        {
                //            event:    "{testEnvironment}.browser.events.onGotoComplete",
                //            listener: "{testEnvironment}.browser.check",
                //            args:     ["[name='checked']"]
                //        },
                //        {
                //            funcName: "gpii.express.user.tests.login.client.loginWithValidUser",
                //            args:     ["{testEnvironment}.harness"]
                //        },
                //        {
                //            listener: "fluid.identity",
                //            event: "{testEnvironment}.harness.events.onReadyToDie"
                //        }
                //    ]
                //},
                {
                    name: "Login with an invalid username and password...",
                    type: "test",
                    sequence: [
                        {
                            func: "console.log",
                            args: ["LOGIN URL: ", "{testEnvironment}.options.loginUrl"]
                        },
                        // TODO:  Content does not seem to be loading.
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
                            listener: "{testEnvironment}.browser.screenshot"
                        },
                        {
                            func:     "{testEnvironment}.browser.click",
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
                            args:     [gpii.tests.browser.tests.elementMatches, ".login-error", "Invalid username or password."]
                        },
                        {
                            event:    "{testEnvironment}.browser.events.onEvaluateComplete",
                            listener: "jqUnit.assertTrue",
                            args:     ["A failure message should now be displayed...", "{arguments}.0"]
                        }
                    ]
                }


//                // The login form should be visible
//                var loginForm = browser.window.$(".login-form");
//                jqUnit.assertNotUndefined("There should be a login form...", loginForm.html());
//                jqUnit.assertEquals("The login form should not be hidden...", "", loginForm.css("display"));
//
//                // A "success" message should be visible
//                var feedback = browser.window.$(".success");
//                jqUnit.assertUndefined("There should not be a positive feedback message...", feedback.html());
//
//                // There should be no alerts
//                var alert = browser.window.$(".alert");
//                jqUnit.assertNotUndefined("There should be an alert...", alert.html());
//                if (alert.html()) {
//                    jqUnit.assertTrue("The alert should have content.", alert.html().trim().length > 0);
//                }
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

