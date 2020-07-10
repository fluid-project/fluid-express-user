// The common test harness wired up as a `fluid.test.testEnvironment` instance.  You are expected to extend this and
// supply a specific test case holder component.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("./test-harness");

fluid.registerNamespace("gpii.test.express.user.environment");

fluid.defaults("gpii.test.express.user.environment", {
    gradeNames:   ["gpii.test.express.testEnvironment"],
    port:         "3959",
    couchPort:    "25984",
    mailPort:     "2525",
    path:         "/",
    templateDirs: {
        user: "%gpii-express-user/src/templates",
        validation: "%gpii-json-schema/src/templates",
        testUser: "%gpii-express-user/tests/templates"
    },
    distributeOptions: {
        source: "{that}.options.mailPort",
        target: "{that gpii.express.user.mailer}.options.transportOptions.port"
    },
    events: {
        onExpressDone: null,
        onFixturesConstructed: {
            events: {
                onExpressReady: "onExpressReady",
                onMailReady:    "onMailReady",
                onCouchReady:   "onCouchReady"
            }
        },
        onFixturesStopped: {
            events: {
                onExpressDone:   "onExpressDone"
            }
        },
        onCouchReady:   null,
        onMailReady:    null,
        stopFixtures:   null
    },
    components: {
        express: {
            type: "gpii.test.express.user.harness.express",
            createOnEvent: "constructFixtures",
            options: {
                events: {
                    stopFixtures: "{testEnvironment}.events.stopFixtures"
                },
                port:  "{testEnvironment}.options.port",
                templateDirs: "{testEnvironment}.options.templateDirs",
                listeners: {
                    "stopFixtures.stopServer": { funcName: "gpii.express.stopServer", args:["{that}"] },
                    "onStopped.notifyParent": { func: "{testEnvironment}.events.onExpressDone.fire"}
                },
                components: {
                    inline: {
                        options: {
                            templateDirs: "{testEnvironment}.options.templateDirs"
                        }
                    },
                    api: {
                        options: {
                            couch:  {
                                port: "{testEnvironment}.options.couchPort"
                            },
                            app: {
                                url:  "{testEnvironment}.options.baseUrl"
                            }
                        }
                    }
                }
            }
        },
        couch: {
            type: "gpii.test.express.user.couch",
            createOnEvent: "constructFixtures",
            options: {
                port: "{testEnvironment}.options.couchPort",
                listeners: {
                    "onStartupComplete.notifyParent": {
                        func: "{testEnvironment}.events.onCouchReady.fire"
                    }
                }
            }
        },
        smtp: {
            type: "gpii.test.mail.smtp",
            createOnEvent: "constructFixtures",
            options: {
                port: "{testEnvironment}.options.mailPort",
                listeners: {
                    "onReady.notifyParent": {
                        func: "{testEnvironment}.events.onMailReady.fire"
                    }
                }
            }
        }
    }
});


fluid.defaults("gpii.test.express.user.environment.withBrowser", {
    gradeNames: ["gpii.test.express.user.environment", "gpii.test.webdriver.testEnvironment"],
    events: {
        onFixturesConstructed: {
            events: {
                onDriverReady:  "onDriverReady",
                onExpressReady: "onExpressReady",
                onMailReady:    "onMailReady",
                onCouchReady:   "onCouchReady"
            }
        },
        onFixturesStopped: {
            events: {
                onDriverStopped: "onDriverStopped",
                onExpressDone:   "onExpressDone"
            }
        }
    },
    components: {
        webdriver: {
            options: {
                events: {
                    onDriverReady: "{testEnvironment}.events.onDriverReady",
                    stopFixtures: "{testEnvironment}.events.stopFixtures"
                },
                listeners: {
                    onQuitComplete:      { func: "{testEnvironment}.events.onDriverStopped.fire" },
                    "stopFixtures.quit": { func: "{that}.quit" }
                }
            }
        }
    }
});
