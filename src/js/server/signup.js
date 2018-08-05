/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

var request = require("request"); // TODO:  Replace this with a writable data source.

require("gpii-handlebars");

require("./lib/datasource");
require("./lib/withMailHandler");
require("./lib/mailer");
require("./lib/password");

fluid.registerNamespace("gpii.express.user.signup.post.handler");

// Check to see if the user exists.
gpii.express.user.signup.post.handler.lookupExistingUser = function (that) {
    that.reader.get(that.options.request.body).then(that.checkForExistingUser);
};

gpii.express.user.signup.post.handler.checkForExistingUser = function (that, utils, response) {
    if (response && response.username) {
        that.sendResponse(403, { isError: true, message: "A user with this email or username already exists."});
    }
    else {
        var body = that.options.request.body;
        utils.createNewUser(body).then(
            function (data) {
                // Save the record for later use in rendering the outgoing email
                that.user = data;
                that.sendMessage();
            },
            function (error, data) {
                that.sendResponse(500, {isError: true, message: error});
            }
        );
    }
};

fluid.defaults("gpii.express.user.signup.post.handler", {
    gradeNames: ["gpii.express.user.withMailHandler"],
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
        mailOptions: {
            to: "user.email",
            subject: { literalValue: "Please verify your account..."}
        },
        mailTemplateContext: {
            app:   "options.app",
            user:  "user"
        }
    },
    urls: "{gpii.express.user.signup.post}.options.urls",
    saltLength: "{gpii.express.user.signup.post}.options.saltLength",
    verifyCodeLength: "{gpii.express.user.signup.post}.options.verifyCodeLength",
    codeKey: "{gpii.express.user.signup.post}.options.codeKey",
    invokers: {
        handleRequest: {
            funcName: "gpii.express.user.signup.post.handler.lookupExistingUser",
            args:     ["{that}"]
        },
        "checkForExistingUser": {
            funcName: "gpii.express.user.signup.post.handler.checkForExistingUser",
            args:     ["{that}", "{gpii.express.user.utils}", "{arguments}.0"]
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "gpii.express.user.couchdb.read",
            options: {
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                url:     "{gpii.express.user.signup.post}.options.urls.read",
                termMap: "{gpii.express.user.signup.post}.options.termMaps.read"
            }
        }
    }
});

fluid.defaults("gpii.express.user.signup.post", {
    gradeNames:       ["gpii.express.user.validationGatedRouter"],
    path:             "/",
    method:           "post",
    saltLength:       32,
    verifyCodeLength: 16,
    codeKey:          "verification_code",  // Must match the value in gpii.express.user.verify
    couchPath:        "/_design/lookup/_view/byUsernameOrEmail",
    handlerGrades:    ["gpii.express.user.signup.post.handler"],
    schemaKey:        "user-signup.json",
    urls: {
        read:  {
            expander: {
                funcName: "fluid.stringTemplate",
                args: [ "%userDbUrl%path?keys=[\"%username\",\"%email\"]", { userDbUrl: "{that}.options.couch.userDbUrl", path: "{that}.options.couchPath"}]
            }
        },
        write: "{that}.options.couch.userDbUrl"
    },
    distributeOptions: [
        {
            source: "{that}.options.rules",
            target: "{that gpii.express.handler}.options.rules"
        },
        {
            source: "{that}.options.app",
            target: "{that gpii.express.user.withMailHandler}.options.app"
        }
    ],
    termMaps: {
        read: { username: "%username", email: "%email"}
    }
});

fluid.defaults("gpii.express.user.signup", {
    gradeNames: ["gpii.express.router"],
    path:       "/signup",
    events: {
        onSchemasDereferenced: null
    },
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
            type: "gpii.express.singleTemplateMiddleware",
            options: {
                templateKey: "pages/signup"
            }
        },
        postRouter: {
            type: "gpii.express.user.signup.post",
            options: {
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.signup}.events.onSchemasDereferenced.fire"
                    }
                }
            }
        }
    }
});
