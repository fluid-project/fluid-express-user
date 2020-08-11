// Function to generate a user when testing the signup functionality on both the server and client side.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.registerNamespace("fluid.test.express.user");

fluid.test.express.user.generateUser = function () {
    var timestamp = Date.now();
    return {
        username: "user-" + timestamp,
        password: fluid.test.express.user.generatePassword(timestamp),
        confirm:  fluid.test.express.user.generatePassword(timestamp),
        email:    "email-" + timestamp + "@localhost"
    };
};

// Generate a simple password that meets our rules.  Used in testing both the signup and reset functions.
fluid.test.express.user.generatePassword = function (timestamp) {
    if (!timestamp) {
        timestamp = Date.now();
    }

    return "Password-" + timestamp;
};
