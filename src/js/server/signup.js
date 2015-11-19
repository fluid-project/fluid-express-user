"use strict";
var fluid  = fluid || require("infusion");
var gpii   = fluid.registerNamespace("gpii");

var request = require("request"); // TODO:  Replace this with a writable data source.

var path      = require("path");
var schemaDir = path.resolve(__dirname, "../../schemas");

require("gpii-handlebars");

require("./lib/datasource");
require("./lib/hasMailerHandler");
require("./lib/mailer");
require("./lib/password");

fluid.registerNamespace("gpii.express.user.api.signup.post.handler");

// Check to see if the user exists.
gpii.express.user.api.signup.post.handler.lookupExistingUser = function (that) {
    that.reader.get(that.request.body).then(that.checkForExistingUser);
};

gpii.express.user.api.signup.post.handler.checkForExistingUser = function (that, response) {
    if (response && response.username) {
        that.sendResponse(403, { ok: false, message: "A user with this email or username already exists."});
        return;
    }

    // Encode the user's password
    var salt        = gpii.express.user.password.generateSalt(that.options.saltLength);
    var derived_key = gpii.express.user.password.encode(that.request.body.password, salt);
    var code        = gpii.express.user.password.generateSalt(that.options.verifyCodeLength);

    // Our rules will set the defaults and pull approved values from the original submission.
    var combinedRecord                   = fluid.model.transformWithRules(that.request.body, that.options.rules.write);

    // Set the "name" to the username for backward compatibility with CouchDB
    combinedRecord.salt                  = salt;
    combinedRecord.derived_key           = derived_key;
    combinedRecord[that.options.codeKey] = code;

    // Set the ID to match the CouchDB conventions, for backward compatibility
    combinedRecord._id = "org.couch.db.user:" + combinedRecord.username;

    // Save the record for later use in rendering the outgoing email
    that.user = combinedRecord;

    // Write the record to couch.  TODO: Migrate this to a writable dataSource.
    var writeOptions = {
        url:    that.options.urls.write,
        method: "POST",
        json:   true,
        body:   combinedRecord
    };
    request(writeOptions, function (error, response, body) {
        if (error) {
            return that.sendResponse(500, {ok: false, message: error});
        }
        else if ([200, 201].indexOf(response.statusCode) === -1) {
            return that.sendResponse(response.statusCode, { ok: false, message: body});
        }
        else {
            that.sendMessage();
        }
    });
};

fluid.defaults("gpii.express.user.api.signup.post.handler", {
    gradeNames: ["gpii.express.user.api.hasMailHandler"],
    templates: {
        mail: {
            text:  "email-verify-text",
            html:  "email-verify-html"
        }
    },
    messages: {
        success: "A verification code and instructions have been sent to your email address.",
        error:   "A verification code could not be sent.  Contact an administrator."
    },
    rules: {
        // Only let the user supply a very particular set of fields.
        write: {
            "name":          "username", // Default rules are designed to cater to CouchDB  and express-couchUser conventions, but can be overriden.
            "username":      "username",
            "email":         "email",
            roles:           { literalValue: []},
            type:            { literalValue: "user"},
            password_scheme: { literalValue: "pbkdf2"},
            iterations:      { literalValue: 10},
            verified:        { literalValue: false}
        },
        mailOptions: {
            subject: { literalValue: "Please verify your account..."}
        }
    },
    urls: "{gpii.express.user.api.signup.post}.options.urls",
    saltLength: "{gpii.express.user.api.signup.post}.options.saltLength",
    verifyCodeLength: "{gpii.express.user.api.signup.post}.options.verifyCodeLength",
    codeKey: "{gpii.express.user.api.signup.post}.options.codeKey",
    invokers: {
        handleRequest: {
            funcName: "gpii.express.user.api.signup.post.handler.lookupExistingUser",
            args:     ["{that}"]
        },
        "checkForExistingUser": {
            funcName: "gpii.express.user.api.signup.post.handler.checkForExistingUser",
            args:     ["{that}", "{arguments}.0"],
            priority: "last"
        }
    },
    components: {
        reader: {
            type: "gpii.express.user.couchdb.read",
            options: {
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                url:     "{gpii.express.user.api.signup.post}.options.urls.read",
                termMap: "{gpii.express.user.api.signup.post}.options.termMaps.read"
            }
        }
    }
});

fluid.defaults("gpii.express.user.api.signup.post", {
    gradeNames:       ["gpii.express.router.passthrough"],
    path:             "/",
    saltLength:       32,
    verifyCodeLength: 16,
    codeKey:          "verification_code",  // Must match the value in gpii.express.user.api.verify
    couchPath:        "/_design/lookup/_view/byUsernameOrEmail",
    urls: {
        read:  {
            expander: {
                funcName: "fluid.stringTemplate",
                args: [ "%userDbUrl%path?keys=[\"%username\",\"%email\"]", { userDbUrl: "{that}.options.couch.userDbUrl", path: "{that}.options.couchPath"}]
            }
        },
        write: "{that}.options.couch.userDbUrl"
    },
    distributeOptions: {
        source: "{that}.options.rules",
        target: "{that gpii.express.handler}.options.rules"
    },
    termMaps: {
        read: { username: "%username", email: "%email"}
    },
    components: {
        schemaMiddleware: {
            type: "gpii.schema.middleware.hasParser",
            options: {
                messages: {
                    error: "Please check the information you have provided."
                },
                schemaDir: schemaDir,
                schemaKey: "user-signup.json",
                schemaUrl: {
                    expander: {
                        funcName: "fluid.stringTemplate",
                        args:     ["%baseUrl/schemas/%schemaKey.json", { baseUrl: "", schemaKey: "{that}.options.schemaKey"}]
                    }
                }
            }
        },
        requestAwareRouter: {
            type: "gpii.express.requestAware.router",
            options: {
                method:           "post",
                path:             "/",
                handlerGrades:    ["gpii.express.user.api.signup.post.handler"]
            }
        }
    }
});


fluid.defaults("gpii.express.user.api.signup", {
    gradeNames: ["gpii.express.router.passthrough"],
    path:       "/signup",
    rules: {
        user: {
            "username": "name", // Default configuration is designed for CouchDB and express-couchUser field naming conventions.
            "email":    "email"
        }
    },
    distributeOptions: [
        {
            source: "{that}.options.couch",
            target: "{that gpii.express.router}.options.couch"
        },
        {
            source: "{that}.options.couch",
            target: "{that gpii.express.handler}.options.couch"
        },
        {
            source: "{that}.options.rules",
            target: "{that gpii.express.handler}.options.rules"
        }
    ],
    components: {
        getRouter: {
            type: "gpii.express.singleTemplateRouter",
            options: {
                templateKey: "pages/signup"
            }
        },
        postRouter: {
            type: "gpii.express.user.api.signup.post"
        }
    }
});