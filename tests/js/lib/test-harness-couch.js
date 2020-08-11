// Just the CouchDB bits of the test harness (which we use independently in testing our datasource grades)
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%fluid-couchdb-test-harness");

fluid.defaults("fluid.test.express.user.couch", {
    gradeNames: ["fluid.test.couchdb.harness"],
    couch: {
        port: "25984"
    },
    databases: {
        "users":   {
            "data": "%fluid-express-user/tests/data/users.json"
        }
    },
    listeners: {
        "onCreate.startup": {
            func: "{that}.startup"
        }
    }
});
