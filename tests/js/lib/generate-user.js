// Function to generate a user when testing the signup functionality on both the server and client side.
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.test.express.user");

gpii.test.express.user.generateUser = function () {
    var timestamp = Date.now();
    return {
        username: "user-" + timestamp,
        password: gpii.express.user.test.generatePassword(timestamp),
        confirm:  gpii.express.user.test.generatePassword(timestamp),
        email:    "email-" + timestamp + "@localhost"
    };
};

// Generate a simple password that meets our rules.  Used in testing both the signup and reset functions.
gpii.express.user.test.generatePassword = function (timestamp) {
    if (!timestamp) {
        timestamp = Date.now();
    }

    return "Password-" + timestamp;
};

