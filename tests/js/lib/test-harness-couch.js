// Just the CouchDB bits of the test harness (which we use independently in testing our datasource grades)
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%gpii-couchdb-test-harness");

fluid.defaults("gpii.test.express.user.couch", {
    gradeNames: ["gpii.test.couchdb.harness"],
    couch: {
        port: "25984"
    },
    databases: {
        "users":   {
            "data": "%gpii-express-user/tests/data/users.json"
        }
    },
    listeners: {
        "onCreate.startup": {
            func: "{that}.startup"
        }
    }
});
