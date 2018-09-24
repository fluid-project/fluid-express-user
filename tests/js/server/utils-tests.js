/*

    Tests for the gpii.express.user.utils component.

 */
/* eslint-env node */
"use strict";

var fluid  = require("infusion");
fluid.logObjectRenderChars = 4096;

var gpii   = fluid.registerNamespace("gpii");
var jqUnit = require("node-jqunit");

require("../lib/");
require("../../../src/js/server/lib/datasource");

fluid.registerNamespace("gpii.express.user.utils.tests");

fluid.defaults("gpii.express.user.utils.tests.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    rawModules: [
        {
            name: "Utils component tests",
            tests: [
                {
                    name: "Unlock username/password",
                    type: "test",
                    expect: 2,
                    sequence: [
                        {
                            funcName: "gpii.express.user.utils.tests.unlockUsernamePassword",
                            args: ["{gpii.express.user.utils}"]
                        }
                    ]
                }
            ]
        }
    ]
});

gpii.express.user.utils.tests.unlockUsernamePassword = function (utils) {
    jqUnit.assert("Ok");
    jqUnit.stop();
    var prom = utils.unlockUser("existing", "password");
    prom.then(function (data) {
        jqUnit.start();
        jqUnit.assertEquals("Check verified username", "existing", data.username);
    }, function (err) {
        jqUnit.start();
        jqUnit.fail("Error unlocking user: " + JSON.stringify(err));
    });
};

fluid.defaults("gpii.express.user.utils.tests", {
    gradeNames: ["gpii.test.express.user.environment"],
    pouchPort: 8764,
    components: {
        testCaseHolder: {
            type: "gpii.express.user.utils.tests.caseHolder"
        },
        utils: {
            type: "gpii.express.user.utils",
            options: {
                couch:  {
                    userDbUrl: "http://127.0.0.1:8764/users"
                }
            }
        }
    }
});

fluid.test.runTests("gpii.express.user.utils.tests");
