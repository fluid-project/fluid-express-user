/* eslint-env node */
"use strict";

var fluid  = require("infusion");

require("fluid-handlebars");

require("./lib/datasource");
require("./lib/withMailHandler");
require("./lib/mailer");
require("./lib/password");

fluid.registerNamespace("fluid.express.user.signup.post.handler");

// TODO: We have to confirm that the passwords match on our own in some function reused in both signup and reset.

// Check to see if the user exists.
fluid.express.user.signup.post.handler.lookupExistingUser = function (that) {
    that.reader.get(that.options.request.body).then(that.checkForExistingUser);
};

fluid.express.user.signup.post.handler.checkForExistingUser = function (that, utils, response) {
    if (response && response.username) {
        that.sendResponse(403, { isError: true, message: "A user with this email or username already exists."});
    }
    // Post Draft v5, JSON Schemas can no longer validate based on the data in the payload, so we have to check this here.
    else if (that.options.request.body.password !== that.options.request.body.confirm) {
        that.sendResponse(400, { isError: true, message: "Your password and confirmation password do not match."});
    }
    else {
        var body = that.options.request.body;
        utils.createNewUser(body).then(
            function (data) {
                // Save the record for later use in rendering the outgoing email
                that.user = data;
                that.sendMessage();
            },
            function (error) {
                that.sendResponse(500, {isError: true, message: error});
            }
        );
    }
};

fluid.defaults("fluid.express.user.signup.post.handler", {
    gradeNames: ["fluid.express.user.withMailHandler"],
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
    urls: "{fluid.express.user.signup.post}.options.urls",
    saltLength: "{fluid.express.user.signup.post}.options.saltLength",
    verifyCodeLength: "{fluid.express.user.signup.post}.options.verifyCodeLength",
    codeKey: "{fluid.express.user.signup.post}.options.codeKey",
    invokers: {
        handleRequest: {
            funcName: "fluid.express.user.signup.post.handler.lookupExistingUser",
            args:     ["{that}"]
        },
        "checkForExistingUser": {
            funcName: "fluid.express.user.signup.post.handler.checkForExistingUser",
            args:     ["{that}", "{fluid.express.user.utils}", "{arguments}.0"]
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "fluid.express.user.couchdb.read",
            options: {
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                url:     "{fluid.express.user.signup.post}.options.urls.read",
                termMap: "{fluid.express.user.signup.post}.options.termMaps.read"
            }
        }
    }
});

fluid.defaults("fluid.express.user.signup.post", {
    gradeNames:       ["fluid.express.user.validationGatedRouter"],
    path:             "/",
    method:           "post",
    saltLength:       32,
    verifyCodeLength: 16,
    codeKey:          "verification_code",  // Must match the value in fluid.express.user.verify
    couchPath:        "/_design/lookup/_view/byUsernameOrEmail",
    handlerGrades:    ["fluid.express.user.signup.post.handler"],
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
            target: "{that fluid.express.handler}.options.rules"
        },
        {
            source: "{that}.options.app",
            target: "{that fluid.express.user.withMailHandler}.options.app"
        }
    ],
    termMaps: {
        read: { username: "%username", email: "%email"}
    },
    components: {
        schemaHolder: {
            type: "fluid.express.user.schemaHolder.signup"
        }
    }
});

fluid.defaults("fluid.express.user.signup", {
    gradeNames: ["fluid.express.router"],
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
            target: "{that fluid.express.router}.options.couch"
        },
        {
            source: "{that}.options.couch",
            target: "{that fluid.express.handler}.options.couch"
        },
        {
            source: "{that}.options.rules",
            target: "{that fluid.express.handler}.options.rules"
        }
    ],
    components: {
        getRouter: {
            type: "fluid.express.singleTemplateMiddleware",
            options: {
                templateKey: "pages/signup"
            }
        },
        postRouter: {
            type: "fluid.express.user.signup.post"
        }
    }
});
