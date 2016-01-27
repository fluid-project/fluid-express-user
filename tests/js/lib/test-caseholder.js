"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-test-browser");
gpii.tests.browser.loadTestingSupport();

fluid.defaults("gpii.express.user.tests.caseHolder", {
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
    ]
});