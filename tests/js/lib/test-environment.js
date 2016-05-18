// The common test harness wired up as a `fluid.test.testEnvironment` instance.  You are expected to extend this and
// supply a specific test case holder component.
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./test-harness");

var kettle = require("kettle");
kettle.loadTestingSupport();

require("gpii-test-browser");
gpii.test.browser.loadTestingSupport();

fluid.defaults("gpii.test.express.user.environment", {
    gradeNames: ["fluid.test.testEnvironment"],
    apiPort:    "3959",
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/", { port: "{that}.options.apiPort"}]
        }
    },
    events: {
        constructFixtures: null,
        onHarnessDone:     null,
        onHarnessReady:    null,
        onFixturesConstructed: {
            events: {
                onHarnessReady: "onHarnessReady"
            }
        },
        onAllDone: {
            events: {
                onHarnessDone: "onHarnessDone"
            }
        }
    },
    pouchPort:  "9599",
    mailPort:   "2525",
    components: {
        harness: {
            type:          "gpii.test.express.user.harness",
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



fluid.defaults("gpii.test.express.user.environment.withBrowser", {
    gradeNames: ["gpii.test.express.user.environment", "gpii.test.browser.environment"],
    events: {
        onFixturesConstructed: {
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
    }
});