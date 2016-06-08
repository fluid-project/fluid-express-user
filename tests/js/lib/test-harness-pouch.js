// Just the PouchDB bits of the test harness (which we use independently in testing our datasource grades)
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("gpii-pouchdb");

fluid.defaults("gpii.test.express.user.pouch", {
    gradeNames: ["gpii.express"],
    port: "3579",
    events: {
        onPouchStarted: null,
        onAllStarted: {
            events: {
                onStarted:      "onStarted",
                onPouchStarted: "onPouchStarted"
            }
        }

    },
    components: {
        pouch: {
            type: "gpii.pouch",
            options: {
                path: "/",
                databases: {
                    "users":   { "data": "%gpii-express-user/tests/data/users.json" }
                },
                listeners: {
                    "onStarted.notifyParent": {
                        func: "{gpii.test.express.user.pouch}.events.onPouchStarted.fire"
                    }
                }
            }
        }
    }
});
