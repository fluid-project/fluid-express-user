/*

  Tests for the password encoding static functions.

 */
/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var jqUnit = require("node-jqunit");

require("../../../src/js/server/lib/password");

fluid.registerNamespace("fluid.express.user.password.tests");
fluid.express.user.password.tests.runTests = function (that) {
    jqUnit.module("Unit test password encoding functions...");

    jqUnit.test("Confirm that a range of known passwords are encoded as expected with full arguments...", function () {
        fluid.each(that.options.expected, function (options, password) {
            var actualEncodedString = fluid.express.user.password.encode(password, options.salt, options.iterations, 20);
            jqUnit.assertEquals("The password should have been encoded correctly...", options.derived_key, actualEncodedString);
        });
    });

    jqUnit.test("Confirm that a range of known passwords are encoded as expected with the defaults...", function () {
        fluid.each(that.options.expected, function (options, password) {
            var actualEncodedString = fluid.express.user.password.encode(password, options.salt);
            jqUnit.assertEquals("The password should have been encoded correctly...", options.derived_key, actualEncodedString);
        });
    });

    jqUnit.test("Confirm that a known password with other arguments is handled correctly...", function () {
        fluid.each(that.options.oddball, function (options, password) {
            var actualEncodedString = fluid.express.user.password.encode(password, options.salt, options.iterations, options.keyLength, options.digest);
            jqUnit.assertEquals("The password should have been encoded correctly...", options.derived_key, actualEncodedString);
        });
    });

    jqUnit.test("Confirm that hashes are generated as expected...", function () {
        var saltString = fluid.express.user.password.generateSalt(24);
        jqUnit.assertEquals("The salt string should be of twice the byte length...", 48, saltString.length);

        var saltInt = parseInt(saltString, 16);
        jqUnit.assertTrue("The salt string should evaluate to a number when parsed as hex...", Number.isInteger(saltInt));

        var secondSaltString = fluid.express.user.password.generateSalt(24);
        jqUnit.assertNotEquals("A different salt should be returned each time...", saltString, secondSaltString);

    });
};

fluid.defaults("fluid.express.user.password.tests", {
    gradeNames: ["fluid.component"],

    expected: {
        "admin": {
            "iterations":  10,
            "derived_key": "18a6afcda1e086610040a7fc482a3d9640fff52e",
            "salt":        "2653c80aabd3889c3dfd6e198d3dca93"
        },
        "local": {
            "iterations":  10,
            "derived_key": "eec0061d71b2ef6633922b27d52311def00a656c",
            "salt":        "2bec993281f3252dc8f56780428121c9"
        }
    },
    // A sample record that uses non-standard options, to confirm that parameters are not overridden.
    oddball: {
        "password": {
            "iterations":  23,
            "keyLength":   32,
            "digest":      "sha1",
            "derived_key": "f34467e93e3f8b73ffaa9781e815be966074c8f34911efc7b7406cb7c8e01c1e",
            "salt":        "secret"
        }

    },
    listeners: {
        "onCreate.runTests": {
            funcName: "fluid.express.user.password.tests.runTests",
            args:     ["{that}"]
        }
    }
});

fluid.express.user.password.tests();
