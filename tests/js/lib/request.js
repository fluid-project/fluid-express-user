/* eslint-env node */
// A request grade common to many tests in this package.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.defaults("fluid.test.express.user.request", {
    gradeNames: ["kettle.test.request.httpCookie"],
    headers: {
        accept: "application/json"
    },
    port: "{testEnvironment}.options.port",
    method: "GET"
});
