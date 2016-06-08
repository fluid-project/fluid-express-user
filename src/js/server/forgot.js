/*

    Provides the first part of a two-step password reset mechanism.  See the documentation for more details:

    https://github.com/GPII/gpii-express-user/blob/master/docs/forgotComponent.md

 */
/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

var request = require("request");

require("./lib/password");
require("./lib/withMailHandler");
require("gpii-handlebars");

fluid.registerNamespace("gpii.express.user.forgot.post.handler");

/**
 *
 * @param that {Object} - The handler component itself.
 * @param user {Object} - The user object we are working with
 */
gpii.express.user.forgot.post.handler.checkUser = function (that, user) {
    if (!user || !user.username) {
        that.sendResponse(404, { ok: false, message: "No matching user found."});
    }
    else {
        // TODO:  Replace this with a writable dataSource
        that.user = fluid.copy(user);
        that.user[that.options.resetCodeKey]  = gpii.express.user.password.generateSalt(that.options.resetCodeLength);
        that.user[that.options.codeIssuedKey] = new Date();

        var writeUrl = fluid.stringTemplate(that.options.urls.write, { id: that.user._id});
        var writeOptions = {
            url:    writeUrl,
            json:   true,
            method: "PUT",
            body:   that.user
        };
        request(writeOptions, that.handleRequestResponse);
    }
};

/**
 *
 * @param that {Object} The handler component instance itself.
 * @param error {Object} The error message (if any) received in response to our CouchDB lookup.
 * @param response {Object} The Express response object.
 * @param body {Object} The response body.
 *
 * Process a response from CouchDB and send the results and/or error message via the `response` object.
 *
 */
gpii.express.user.forgot.post.handler.handleRequestResponse = function (that, error, response, body) {
    if (error) {
        that.sendResponse(500, { ok: false, message: error.message, stack: error.stack });
    }
    else if (response && [200, 201].indexOf(response.statusCode) === -1) {
        that.sendResponse(response.statusCode, { ok: false, message: body });
    }
    else {
        that.sendMessage();
    }
};

fluid.defaults("gpii.express.user.forgot.post.handler", {
    gradeNames: ["gpii.express.user.withMailHandler"],
    messages: {
        success: "A password reset code and instructions have been sent to your email address.",
        error:   "A password reset code could not be sent.  Contact an administrator."
    },
    rules: {
        mailOptions: {
            to:      "user.email",
            subject: { literalValue: "Reset your password..."}
        }
    },
    members: {
        user: null
    },
    invokers: {
        handleRequest: {
            func: "{reader}.get",
            args: ["{that}.options.request.body"]
        },
        handleRequestResponse: {
            funcName: "gpii.express.user.forgot.post.handler.handleRequestResponse",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // error, response, body
        }

    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "gpii.express.user.couchdb.read",
            options: {
                url:     "{gpii.express.user.forgot}.options.urls.read",
                termMap: { email: "%email"},
                rules: {
                    read: {
                        "" : "rows.0.value"
                    }
                },
                listeners: {
                    "onRead.checkUser": {
                        func:     "gpii.express.user.forgot.post.handler.checkUser",
                        args:     ["{gpii.express.user.forgot.post.handler}", "{arguments}.0"] // The response from our dataSource
                    }
                }
            }
        }
    }
});

fluid.registerNamespace("gpii.express.user.forgot.post");
fluid.defaults("gpii.express.user.forgot.post", {
    gradeNames: ["gpii.express.middleware.requestAware"],
    path:       "/",
    method:     "post",
    // distributeOptions: {
    //     source: "{that}.options.urls",
    //     target: "{that > gpii.express.handler}.options.urls"
    // },
    handlerGrades: ["gpii.express.user.forgot.post.handler"]
});

fluid.defaults("gpii.express.user.forgot", {
    gradeNames: ["gpii.express.router"],
    path:       "/forgot",
    templates: {
        form:     "pages/forgot",
        mail: {
            text: "email-forgot-text",
            html: "email-forgot-html"
        }
    },
    urls: {
        read: {
            expander: {
                funcName: "fluid.stringTemplate",
                args: [
                    "%userDbUrl/_design/lookup/_view/byUsernameOrEmail?key=\"%email\"",
                    "{that}.options.couch"
                ]
            }
        },
        write: {
            expander: {
                funcName: "fluid.stringTemplate",
                args: [
                    "%userDbUrl/%id",
                    "{that}.options.couch"
                ]
            }
        }
    },
    resetCodeLength: 16,
    // Both of these should match what is used in `gpii.express.user.reset`
    resetCodeKey:   "reset_code",
    codeIssuedKey:  "reset_code_issued",
    distributeOptions: [
        {
            source: "{that}.options.urls",
            target: "{that gpii.express.handler}.options.urls"
        },
        {
            source: "{that}.options.templates",
            target: "{that gpii.express.handler}.options.templates"
        },
        {
            source: "{that}.options.templateDirs",
            target: "{that > gpii.express.router}.options.templateDirs"
        },
        {
            source: "{that}.options.resetCodeKey",
            target: "{that gpii.express.handler}.options.resetCodeKey"
        },
        {
            source: "{that}.options.resetCodeLength",
            target: "{that gpii.express.handler}.options.resetCodeLength"
        },
        {
            source: "{that}.options.codeIssuedKey",
            target: "{that gpii.express.handler}.options.codeIssuedKey"
        },
        {
            source: "{that}.options.app",
            target: "{that gpii.express.user.withMailHandler}.options.app"
        }
    ],
    components: {
        getRouter: {
            type: "gpii.express.singleTemplateMiddleware",
            options: {
                templateKey: "{gpii.express.user.forgot}.options.templates.form",
                defaultContext: "{gpii.express.user.forgot}.options.defaultContext"
            }
        },
        postRouter: {
            type: "gpii.express.user.forgot.post"
        }
    }
});
