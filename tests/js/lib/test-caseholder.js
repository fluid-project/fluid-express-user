/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-test-browser");
gpii.test.browser.loadTestingSupport();

fluid.defaults("gpii.test.express.user.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder"],
    sequenceEnd: [
        {
            func: "{testEnvironment}.harness.destroy"
        },
        {
            listener: "fluid.identity",
            event: "{testEnvironment}.events.onAllDone"
        }
    ]
});

fluid.defaults("gpii.test.express.user.caseHolder.withBrowser", {
    gradeNames: ["gpii.test.express.caseHolder"],
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
