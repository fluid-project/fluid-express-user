/*

  Tests for the gpii.express.user.utils component.

 */
/* eslint-env node */
"use strict";

var fluid        = require("infusion");
var gpii         = fluid.registerNamespace("gpii");

require("../../../");
require("../lib/");

var jqUnit       = require("node-jqunit");

fluid.registerNamespace("gpii.tests.express.user.utils.caseHolder");

gpii.tests.express.user.utils.createUser = function (utils) {
    var prom = utils.createNewUser({
        username: "myFirstUser",
        password: "this is a password",
        email: "myFirstUser@gpii.net"
    });
    prom.then(function (data) {
        jqUnit.assertEquals("Generated Couch ID", "org.couch.db.user:myFirstUser", data._id);
        jqUnit.assertEquals("Email", "myFirstUser@gpii.net", data.email);
        jqUnit.assertEquals("Username", "myFirstUser", data.username);
        jqUnit.assertTrue("Unlock the password", gpii.express.user.utils.verifyPassword(data, "this is a password"));
    }, function (err) {
        jqUnit.fail("Unable to create user with error: " + err);
    });
    return prom;
};

// TODO Can the Infusion IoC tasks resolve references? ie. instead of this function
// use {
//    task: ["{gpii.express.user.utils}.unlockUser"],
//    args: ["existing", "password"],
gpii.tests.express.user.utils.unlockPromise = function (utils, username, password) {
    return utils.unlockUser(username, password);
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`,
// and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.tests.express.user.utils.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    rawModules: [
        {
            name: "Testing login functions...",
            tests: [
                {
                    name: "Create a new user and verify their data.",
                    type: "test",
                    sequence: [
                        {
                            task: "gpii.tests.express.user.utils.createUser",
                            args: ["{gpii.express.user.utils}"],
                            resolve: "jqUnit.assert",
                            resolveArgs: ["Successfully created User"]
                        }
                    ]
                },
                {
                    name: "Testing unlocking a user with correct credentials.",
                    type: "test",
                    sequence: [
                        {
                            task: "gpii.tests.express.user.utils.unlockPromise",
                            args: ["{gpii.express.user.utils}", "existing", "password"],
                            resolve: "jqUnit.assertEquals",
                            resolveArgs: ["Check verified username", "existing", "{arguments}.0.username"]
                        }
                    ]
                },
                {
                    name: "Testing not unlocking a user with incorrect credentials.",
                    type: "test",
                    sequence: [
                        {
                            task: "gpii.tests.express.user.utils.unlockPromise",
                            args: ["{gpii.express.user.utils}", "not-existing", "password"],
                            reject: "jqUnit.assert",
                            rejectArgs: ["Succeeded in not unlocking with incorrect credentials."]
                        }
                    ]
                }

            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.utils.environment", {
    gradeNames: ["gpii.test.express.user.environment"],
    port:       8778,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "gpii.tests.express.user.utils.caseHolder"
        },
        utils: {
            type: "gpii.express.user.utils",
            options: {
                couch:  {
                    port: 25984,
                    userDbUrl: {
                        expander: {
                            funcName: "fluid.stringTemplate",
                            args: ["http://127.0.0.1:%port/users", { port: "{utils}.options.couch.port"}]
                        }
                    }
                }
            }
        }
    }
});

fluid.test.runTests("gpii.tests.express.user.utils.environment");
