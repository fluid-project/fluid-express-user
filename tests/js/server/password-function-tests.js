/*

  Tests for the password encoding static functions.

 */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");
var jqUnit = require("node-jqunit");

require("../../../src/js/server/lib/password");

fluid.registerNamespace("gpii.express.user.password.tests");
gpii.express.user.password.tests.runTests = function (that) {
    jqUnit.module("Unit test password encoding functions...");

    jqUnit.test("Confirm that a range of known passwords are encoded as expected with full arguments...", function () {
        fluid.each(that.options.expected, function (options, password) {
            var actualEncodedString = gpii.express.user.password.encode(password, options.salt, options.iterations, 20);
            jqUnit.assertEquals("The password should have been encoded correctly...", options.derived_key, actualEncodedString);
        });
    });

    jqUnit.test("Confirm that a range of known passwords are encoded as expected with the defaults...", function () {
        fluid.each(that.options.expected, function (options, password) {
            var actualEncodedString = gpii.express.user.password.encode(password, options.salt);
            jqUnit.assertEquals("The password should have been encoded correctly...", options.derived_key, actualEncodedString);
        });
    });

    jqUnit.test("Confirm that a known password with other arguments is handled correctly...", function () {
        fluid.each(that.options.oddball, function (options, password) {
            var actualEncodedString = gpii.express.user.password.encode(password, options.salt, options.iterations, options.keyLength, options.digest);
            jqUnit.assertEquals("The password should have been encoded correctly...", options.derived_key, actualEncodedString);
        });
    });

    jqUnit.test("Confirm that hashes are generated as expected...", function () {
        var saltString = gpii.express.user.password.generateSalt(24);
        jqUnit.assertEquals("The salt string should be of twice the byte length...", 48, saltString.length);

        var saltInt = parseInt(saltString, 16);
        jqUnit.assertTrue("The salt string should evaluate to a number when parsed as hex...", Number.isInteger(saltInt));

        var secondSaltString = gpii.express.user.password.generateSalt(24);
        jqUnit.assertNotEquals("A different salt should be returned each time...", saltString, secondSaltString);

    });
};

fluid.defaults("gpii.express.user.password.tests", {
    gradeNames: ["fluid.component"],
    expected: {
        "admin": {
            "iterations":  10,
            "derived_key": "9ff4bc1c1846181d303971b08b65122a45174d04",
            "salt":        "2653c80aabd3889c3dfd6e198d3dca93"
        },
        "local": {
            "iterations":  10,
            "derived_key": "3cfbf59bba56c7f364973c11c5bd7f78e6879e23",
            "salt":        "2bec993281f3252dc8f56780428121c9"
        }
    },
    // A sample record that uses non-standard options, to confirm that parameters are not overridden.
    oddball: {
        "password": {
            "iterations":  23,
            "keyLength":   32,
            "digest":      "sha256",
            "derived_key": "8263cc1c1ccad9780c8ad66df3cd6cbae517bbd6f99d27c0512e3383ed045229",
            "salt":        "secret"
        }

    },
    listeners: {
        "onCreate.runTests": {
            funcName: "gpii.express.user.password.tests.runTests",
            args:     ["{that}"]
        }
    }
});

fluid.test.runTests("gpii.express.user.password.tests");