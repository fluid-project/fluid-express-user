// Just the PouchDB bits of the test harness (which we use independently in testing our datasource grades)
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("gpii-pouchdb");

fluid.defaults("gpii.test.express.user.pouch", {
    gradeNames: ["gpii.express"],
    port: "3579",
    events: {
        onCleanup:         null,
        onCleanupComplete: null,
        onPouchStarted:    null
    },
    components: {
        pouch: {
            type: "gpii.pouch.express",
            options: {
                path: "/",
                events: {
                    onCleanup: "{gpii.test.express.user.pouch}.events.onCleanup"
                },
                databases: {
                    "users":   { "data": "%gpii-express-user/tests/data/users.json" }
                },
                listeners: {
                    "onStarted.notifyParent": {
                        func: "{gpii.test.express.user.pouch}.events.onPouchStarted.fire"
                    },
                    "onCleanupComplete.notifyParent": {
                        func: "{gpii.test.express.user.pouch}.events.onCleanupComplete.fire"
                    }
                }
            }
        }
    }
});

