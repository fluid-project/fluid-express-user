// A convenience script to start up a copy of the test harness for manual QA.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

require("./lib/test-harness");

fluid.test.express.user.harness({
    port:    "3959",
    mailPort:   "9225"
});
