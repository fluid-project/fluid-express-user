/*

    A static function to consistently encode a password.  Used when storing passwords in CouchDB, and when logging in
    using a username and password.

    This package uses the `pbkdf2` functions provided by the `crypto` package built into node.  It has been tested to
    work specifically with the encoded passwords saved by CouchDB itself and by the express-couchUser package.  The
    default digest is `sha1`.  Using any other digest function is not likely to be backward compatible with Couch user accounts.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

var crypto = require("crypto");

fluid.registerNamespace("fluid.express.user.password");
fluid.express.user.password.encode = function (password, salt, iterations, keyLength, digest) {
    // Set defaults that are useful in dealing with CouchDB and express-couchUser data.
    iterations = iterations !== undefined ? iterations : 10;
    keyLength  = keyLength !== undefined ? keyLength : 20;
    digest     = digest !== undefined ? digest : "sha256";

    // This will fail horribly if the password is not a number, array, or string, you are expected to catch errors.
    var hexEncodedValue = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);
    return hexEncodedValue.toString("hex");
};

// Return a hex string that represents byte data that is `lengthInBytes` length.  For example, `generateSalt(1)` might
// return `c3`.
//
fluid.express.user.password.generateSalt = function (lengthInBytes) {
    return crypto.randomBytes(lengthInBytes).toString("hex");
};
