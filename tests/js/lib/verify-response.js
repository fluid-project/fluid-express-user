/*

    Static function to perform basic sanity checks on an HTTP response.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

var jqUnit = require("node-jqunit");

fluid.registerNamespace("fluid.test.express");
fluid.test.express.user.verifyResponse = function (response, body, statusCode, truthy, falsy) {
    if (!statusCode) { statusCode = 200; }
    fluid.test.express.helpers.isSaneResponse(response, body, statusCode);

    var data = typeof body === "string" ? JSON.parse(body) : body;

    if (truthy) {
        truthy.forEach(function (key) {
            jqUnit.assertTrue("The data for '" + key + "' should be truthy...", data[key]);
        });
    }

    if (falsy) {
        falsy.forEach(function (key) {
            jqUnit.assertFalse("The data for '" + key + "' should be falsy...", data[key]);
        });
    }
};
