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

gpii.tests.express.user.utils.unlockUsernamePassword = function (utils, sequenceDelay) {
    var prom = utils.unlockUser("existing", "password");
    prom.then(function (data) {
        jqUnit.assertEquals("Check verified username", "existing", data.username);
        sequenceDelay.events.onComplete.fire();
    }, function (err) {
        jqUnit.fail("Error unlocking user: " + JSON.stringify(err));
        sequenceDelay.events.onComplete.fire();
    });
};

/**
 * Simple component with an onComplete event to use as a delay in the tests sequences
 * when executing promises or other logic in a custom test method.
 */
fluid.defaults("gpii.tests.express.user.sequenceDelay", {
    gradeNames: ["fluid.component"],
    events: {
        onComplete: null
    }
});

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.tests.express.user.utils.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    components: {
        sequenceDelay: {
            type: "gpii.tests.express.user.sequenceDelay"
        }
    },
    rawModules: [
        {
            name: "Testing login functions...",
            tests: [
                {
                    name: "Testing logging in with an unverified account...",
                    type: "test",
                    sequence: [
                        {
                            funcName: "gpii.tests.express.user.utils.unlockUsernamePassword",
                            args: ["{gpii.express.user.utils}", "{sequenceDelay}"]
                        },
                        {
                            listener: "fluid.log",
                            event: "{sequenceDelay}.events.onComplete",
                            args: ["Finished unlockUsernamePassword test"]
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
    pouchPort:  8764,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "gpii.tests.express.user.utils.caseHolder"
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

fluid.test.runTests("gpii.tests.express.user.utils.environment");
