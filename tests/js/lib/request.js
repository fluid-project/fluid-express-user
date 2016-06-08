/* eslint-env node */
// A request grade common to many tests in this package.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.defaults("gpii.test.express.user.request", {
    gradeNames: ["gpii.test.express.request"],
    headers: {
        accept: "application/json"
    },
    port: "{testEnvironment}.options.apiPort"
});
