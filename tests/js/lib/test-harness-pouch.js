// Just the PouchDB bits of the test harness (which we use independently in testing our datasource grades)
var fluid = require("infusion");

require("gpii-pouchdb");

fluid.defaults("gpii.express.user.tests.pouch", {
    gradeNames: ["gpii.express"],
    pouchPort: "3579",
    config: {
        express: {
            port: "{that}.options.pouchPort"
        }
    },
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
                        func: "{gpii.express.user.tests.pouch}.events.onPouchStarted.fire"
                    }
                }
            }
        }
    }
});
