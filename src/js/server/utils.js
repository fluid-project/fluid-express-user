/*

    Utilities methods for performing user operations. These utilities should
    be usable from both http endpoints, and any other locations that can
    consume promise based API's.

    Utilities are included for:
    - Creating new user accounts
    - Unlocking user accounts with a username/email and password.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var request = require("request"); // TODO:  Replace this with a writable data source.

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.user.utils");

/**
 *  gpii.express.user.utils
 *
 *  Component that implements backend utilities as promise based
 *  invokers that can be used from http handers or other infrastructure.
 *
 *  Expects to be distributed the same couch options as the other components
 *  in gpii-express-user.
 */
fluid.defaults("gpii.express.user.utils", {
    gradeNames: ["fluid.component"],
    invokers: {
        createNewUser: {
            funcName: "gpii.express.user.utils.createNewUser",
            args: ["{that}", "{arguments}.0"] // options
        },
        unlockUser: {
            funcName: "gpii.express.user.utils.unlockUser",
            args: ["{that}", "{arguments}.0", "{arguments}.1"] // username, password
        }
    },
    byUsernameOrEmailUrl:    {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     [ "%userDbUrl/_design/lookup/_view/byUsernameOrEmail?key=\"%username\"", "{that}.options.couch"]
        }
    },
    writeUrl: "{that}.options.couch.userDbUrl",
    saltLength:       32,
    verifyCodeLength: 16,
    codeKey:          "verification_code",  // Must match the value in gpii.express.user.verify
    rules: {
        createUserWrite: {
            "name":          "username", // Default rules are designed to cater to CouchDB  and express-couchUser conventions, but can be overriden.
            "username":      "username",
            "email":         "email",
            roles:           { literalValue: []},
            type:            { literalValue: "user"},
            password_scheme: { literalValue: "pbkdf2"},
            iterations:      { literalValue: 10},
            verified:        { literalValue: false}
        }
    },
    components: {
        byUsernameOrEmailReader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "gpii.express.user.couchdb.read",
            options: {
                url: "{gpii.express.user.utils}.options.byUsernameOrEmailUrl",
                rules: {
                    read: {
                        "":         "rows.0.value",
                        "username": "rows.0.value.name"
                    }
                },
                termMap: { username: "%username"}
            }
        }
    }
});

/**
 * Creates a new gpii-express-user in the configured user database.
 * `userData` is an object of values to create the new user with.
 * At the very least this should consist of values for `username`,
 * `email`, and `password`. The transformation acting on this data
 * is located at `{gpii.express.user.utils}.rules.createUserWrite`.
 *
 * @param {gpii.express.user.utils} that - Utils Component
 * @param {Object} userData - Object with values for the new user.
 * @param {String} userData.username - New users username
 * @param {String} userData.email - New users email
 * @param {String} userData.password - Password for new account
 * @return {Promise} Promise containing either the new CouchDB record for
 * the account or an `error` property and message.
 */
gpii.express.user.utils.createNewUser = function (that, userData) {
    // Encode the user's password
    var salt        = gpii.express.user.password.generateSalt(that.options.saltLength);
    var derived_key = gpii.express.user.password.encode(userData.password, salt);
    var code        = gpii.express.user.password.generateSalt(that.options.verifyCodeLength);

    // Our rules will set the defaults and pull approved values from the original submission.
    var combinedRecord                   = fluid.model.transformWithRules(userData, that.options.rules.createUserWrite);

    // Set the "name" to the username for backward compatibility with CouchDB
    combinedRecord.salt                  = salt;
    combinedRecord.derived_key           = derived_key;
    combinedRecord[that.options.codeKey] = code;

    // Set the ID to match the CouchDB conventions, for backward compatibility
    combinedRecord._id = "org.couch.db.user:" + combinedRecord.username;

    // Write the record to couch.  TODO: Migrate this to a writable dataSource.
    var writeOptions = {
        url:    that.options.writeUrl,
        method: "POST",
        json:   true,
        body:   combinedRecord
    };
    var promiseTogo = fluid.promise();
    request(writeOptions, function (error, response, body) {
        if (error) {
            promiseTogo.reject({isError: true, message: error});
        }
        else if ([200, 201].indexOf(response.statusCode) === -1) {
            promiseTogo.reject({ isError: true, message: body});
        }
        else {
            promiseTogo.resolve(combinedRecord);
        }
    });
    return promiseTogo;
};

/**
 * gpii.express.user.utils.verifyPassword function
 *
 * Given an instance of our standard couch `userRecord`, and the clear text
 * `password`, check to see if the password is valid for for the user.
 *
 * @param {Object} userRecord - Our standard internal user object stored in CouchDB.
 * @param {String} password - Password to use to login/unlock user.
 * @return {Boolean} - True if this is the correct password, otherwise false.
 */
gpii.express.user.utils.verifyPassword = function (userRecord, password) {
    var encodedPassword = gpii.express.user.password.encode(password,
        userRecord.salt, userRecord.iterations, userRecord.keyLength, userRecord.digest);
    return encodedPassword === userRecord.derived_key;
};

/**
 * gpii.express.user.utils.unlockUser method
 *
 * Attempts to look up username using the current CouchDB view. (At the time
 * of writing either username or email). And unlock their account using `password`.
 * If the username and password match, the CouchDB `userData` record will be returned.
 * Otherwise a standard error Object is returned.
 *
 * @param {gpii.express.user.utils} that - Utils component.
 * @param {String} username - Username to use for record lookup.
 * @param {String} password - Clear text password to validate record with.
 * @return {Object} The `userData` record if the password is correct, otherwise
 * an `isError` Object.
 */
gpii.express.user.utils.unlockUser = function (that, username, password) {
    var promiseTogo = fluid.promise();
    that.byUsernameOrEmailReader.get({username: username}).then(
        function (body) {
            if (body.username) {
                var user = body;
                var encodedPassword = gpii.express.user.password.encode(password, user.salt, user.iterations, user.keyLength, user.digest);
                if (encodedPassword === user.derived_key) {
                    promiseTogo.resolve(user);
                }
                else {
                    promiseTogo.reject({isError: true, message: "Bad username/password"});
                }
            }
            else {
                promiseTogo.reject({isError: true, message: "Bad username/password"});
            }
        },
        function (err) {
            promiseTogo.reject({isError: true, message: "Bad username/password" + JSON.stringify(err)});
        }
    );
    return promiseTogo;
};
