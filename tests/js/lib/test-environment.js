// The common test harness wired up as a `fluid.test.testEnvironment` instance.  You are expected to extend this and
// supply a specific test case holder component.
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./test-harness");

var kettle = require("kettle");
kettle.loadTestingSupport();

require("gpii-test-browser");
gpii.tests.browser.loadTestingSupport();

fluid.defaults("gpii.express.user.tests.environment", {
    gradeNames: ["gpii.tests.browser.environment"],
    apiPort:    "3959",
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/api/user/", { port: "{that}.options.apiPort"}]
        }
    },
    events: {
        onHarnessDone: null,
        onHarnessReady: null,
        onReady: {
            events: {
                onBrowserReady: "onBrowserReady",
                onHarnessReady: "onHarnessReady"
            }
        },
        onAllDone: {
            events: {
                onBrowserDone: "onBrowserDone",
                onHarnessDone: "onHarnessDone"
            }
        }
    },
    pouchPort:  "9599",
    mailPort:   "2525",
    components: {
        // Currently, the browser's `onLoaded` event will fail frequently if the browser is not visible.
        browser: {
            options: {
                nightmareOptions: { show: true }
            }
        },
        harness: {
            type:          "gpii.express.user.tests.harness",
            createOnEvent: "constructFixtures",
            options: {
                apiPort:   "{testEnvironment}.options.apiPort",
                mailPort:  "{testEnvironment}.options.mailPort",
                pouchPort: "{testEnvironment}.options.pouchPort",
                listeners: {
                    "onStarted.notifyParent": {
                        func: "{testEnvironment}.events.onHarnessReady.fire"
                    },
                    "onDone.notifyParent": {
                        func: "{testEnvironment}.events.onHarnessDone.fire"
                    }
                }
            }
        }
    }
});
