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

require("gpii-pouchdb");
gpii.pouch.loadTestingSupport();

fluid.registerNamespace("gpii.express.user.utils.tests");

fluid.defaults("gpii.express.user.utils.tests.caseHolder", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [ {
        name: "Utils component tests",
        tests: [{
            expect: 2,
            name: "Unlock username/password",
            sequence: [{
                funcName: "gpii.express.user.utils.tests.unlockUsernamePassword",
                args: ["{gpii.express.user.utils}"]
            }]
        }]
    }]
});

gpii.express.user.utils.tests.unlockUsernamePassword = function (utils) {
    jqUnit.assert("Ok");
    // jqUnit.fail("Ok 2");
    var prom = utils.unlockUser("existing", "password");
    prom.then(function (data) {
        jqUnit.assertEquals("Check verified username", "username", data.username);
    }, function (err) {
        jqUnit.fail("Error unlocking user: " + JSON.stringify(err));
    });
};

fluid.defaults("gpii.express.user.utils.tests.pouchMixin", {
    gradeNames: ["fluid.component"],
    databases: {
        myEmptyDb: {},
        myFullDb: {
            data: "%gpii-express-user/tests/data/users.json"
        }
    }
});

fluid.defaults("gpii.express.user.utils.tests", {
    gradeNames: ["gpii.test.pouch.environment"],
    port: 5001,
    harnessGrades: ["gpii.express.user.utils.tests.pouchMixin"],
    components: {
        testCaseHolder: {
            type: "gpii.express.user.utils.tests.caseHolder"
        },
        utils: {
            type: "gpii.express.user.utils",
            options: {
                couch:  {
                    // port: "{testEnvironment}.options.pouchPort",
                    port: "5001",
                    userDbName: "users",
                    userDbUrl: "http://127.0.0.1:5001/users"
                }
            }
        }
    }
});

fluid.test.runTests("gpii.express.user.utils.tests");
