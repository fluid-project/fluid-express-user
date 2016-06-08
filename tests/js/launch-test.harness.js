// A convenience script to start up a copy of the test harness for manual QA.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var gpii = fluid.registerNamespace("gpii");

require("./lib/test-harness");

gpii.test.express.user.harness({
    pouchPort:  "9599",
    apiPort:    "3959",
    mailPort:   "9225"
});
