"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-test-browser");
gpii.tests.browser.loadTestingSupport();

fluid.defaults("gpii.express.user.tests.caseHolder.base", {
    gradeNames: ["gpii.express.tests.caseHolder.base"],
    sequenceStart: [
        {
            func: "{testEnvironment}.events.constructFixtures.fire"
        },
        {
            listener: "fluid.identity",
            event: "{testEnvironment}.events.onReady"
        }
    ]
});

fluid.defaults("gpii.express.user.tests.caseHolder", {
    gradeNames: ["gpii.express.user.tests.caseHolder.base"],
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

fluid.defaults("gpii.express.user.tests.caseHolder.withBrowser", {
    gradeNames: ["gpii.express.user.tests.caseHolder.base"],
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