/* eslint-env node */
/*

  Provides the second half of the password reset API, and handles the last two steps.  Before using this, a user must
  have generated a reset code using the `forgot` API.  They are sent a link via email that includes a reset code.

  When they follow that link, the GET portion of this API checks the validity of the code.  If the code exists and has
  not expired, a form with a password and confirmation field is displayed.

  The POST portion of this API accepts the password, confirmation, and the reset code.  It checks to confirm that the
  code corresponds to a valid user.

 */
"use strict";
var fluid  = require("infusion");

require("fluid-handlebars");

require("./lib/password");
require("./lib/datasource");
require("./passwordEncryptOptions");

// TODO: We have to confirm that the passwords match on our own in some function reused in both signup and reset.

// TODO:  Replace this with a writable `dataSource`
var request = require("request");

fluid.registerNamespace("fluid.express.user.reset.handler");

fluid.express.user.reset.handler.checkResetCode = function (that, dataSourceResponse) {
    // Prepare dates that will be used in later sanity checks.
    var earliestAcceptable = new Date(Date.now() - that.options.codeExpiration);
    var issueDate          = new Date(dataSourceResponse[that.options.codeIssuedKey]);

    // TODO: Use a message key "fluid.express.user.reset.code.invalid": "The reset code you provided is invalid."
    if (!dataSourceResponse || !dataSourceResponse[that.options.codeKey] || (that.options.request.params.code !== dataSourceResponse[that.options.codeKey])) {
        that.sendFinalResponse(400, { isError: true, message: "You must provide a valid reset code to use this interface."});
    }
    // We cannot perform the next two checks using JSON Schema, so we must do it here.
    // We should not accept a reset code issued earlier than the current time minus our expiration period (a day by default).
    // TODO: Use  the message "fluid.express.user.reset.code.expired": "Your reset code is too old.  Please request another one."
    else if (isNaN(issueDate) || issueDate < earliestAcceptable) {
        that.sendFinalResponse(400, { isError: true, message: "Your reset code is too old.  Please request another one."});
    }
    // Post Draft v5, JSON Schemas can no longer validate based on the data in the payload, so we have to check this here.
    else if (that.options.request.body.password !== that.options.request.body.confirm) {
        that.sendFinalResponse(400, { isError: true, message: "Your password and confirmation password do not match."});
    }
    else {
        var updatedUserRecord = fluid.model.transformWithRules({ userData: dataSourceResponse, options: that.options}, that.options.rules.updateUser);
        delete updatedUserRecord[that.options.codeKey];

        var salt                      = fluid.express.user.password.generateSalt(that.options.saltLength);
        updatedUserRecord.salt        = salt;
        updatedUserRecord.derived_key = fluid.express.user.password.encode(that.options.request.body.password, salt, that.options.iterations, that.options.keyLength, that.options.digest);

        // TODO:  Convert this to use a writable dataSource
        var writeUrl = fluid.stringTemplate(that.options.urls.write, { id: updatedUserRecord._id});
        var writeOptions = {
            url:    writeUrl,
            json:   true,
            method: "PUT",
            body:   updatedUserRecord
        };
        request(writeOptions, function (error, response, body) {
            if (error) {
                that.sendFinalResponse(500, { isError: true, message: error});
            }
            else if ([201, 200].indexOf(response.statusCode) === -1) {
                that.sendFinalResponse(response.statusCode, { isError: true, message: body});
            }
            else {
                // TODO: Use message key "fluid.express.user.reset.success": "Your password has been reset."
                that.sendFinalResponse(200, { message: "Your password has been reset."});
            }
        });
    }
};

fluid.defaults("fluid.express.user.reset.handler", {
    gradeNames:  ["fluid.express.handler", "fluid.express.user.passwordEncryptOptionsConsumer"],
    rules: {
        updateUser: {
            "": "userData",
            iterations: "options.iterations",
            keyLength: "options.keyLength",
            digest: "options.digest"
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "fluid.express.user.couchdb.read",
            options: {
                url: "{fluid.express.user.reset}.options.urls.read",
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                termMap: { code: "%code"},
                listeners: {
                    "onRead.checkResetCode": {
                        nameSpace: "fluid.express.user.reset",
                        funcName:  "fluid.express.user.reset.handler.checkResetCode",
                        args:      ["{fluid.express.handler}", "{arguments}.0"] // dataSource response
                    },
                    "onError.sendErrorResponse": {
                        func: "{fluid.express.user.reset.handler}.sendFinalResponse",
                        args: [500, { isError: true, message: "{arguments}.0"}]
                    }
                }
            }
        }
        // TODO:  Add writable data source
    },
    invokers: {
        handleRequest: {
            func: "{that}.reader.get",
            args: ["{that}.options.request.params"]
        },
        sendFinalResponse: {
            func: "{that}.sendResponse",
            args: ["{arguments}.0", "{arguments}.1"] // statusCode, response
        }
    }
});

fluid.defaults("fluid.express.user.reset.post", {
    gradeNames:    ["fluid.express.user.validationGatedRouter", "fluid.express.user.passwordEncryptOptionsConsumer"],
    method:        "post",
    path:          "/:code",
    routerOptions: {
        mergeParams: true
    },
    handlerGrades: ["fluid.express.user.reset.handler"],
    components: {
        schemaHolder: {
            type: "fluid.express.user.schemaHolder.reset"
        },
        validationMiddleware: {
            options: {
                rules: {
                    requestContentToValidate: {
                        "": "body",
                        "code": "params.code"
                    }
                }
            }
        }
    }
});


// GET /api/user/reset/:code, a `singleTemplateRouter` that just serves up the client-side form.
fluid.defaults("fluid.express.user.reset.formRouter", {
    gradeNames:  ["fluid.express.singleTemplateMiddleware"],
    path:        "/:code",
    method:      "get",
    templateKey: "pages/reset"
});

fluid.defaults("fluid.express.user.reset", {
    gradeNames:    ["fluid.express.router", "fluid.express.user.passwordEncryptOptionsConsumer"],
    method:        "use",
    path:          "/reset",
    // The next two variables must match the value in fluid.express.user.forgot
    codeKey:       "reset_code",
    codeIssuedKey: "reset_code_issued",
    codeExpiration: 86400000, // How long a reset code is valid, in milliseconds.  Defaults to a day.
    urls: {
        read: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     [ "%userDbUrl/_design/lookup/_view/byResetCode?key=\"%code\"", "{that}.options.couch"]
            }
        },
        write: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     [ "%userDbUrl/%id", "{that}.options.couch"]
            }
        }
    },
    distributeOptions: [
        {
            source: "{that}.options.codeKey",
            target: "{that fluid.express.handler}.options.codeKey"
        },
        {
            source: "{that}.options.urls",
            target: "{that fluid.express.handler}.options.urls"
        },
        {
            source: "{that}.options.codeIssuedKey",
            target: "{that fluid.express.handler}.options.codeIssuedKey"
        },
        {
            source: "{that}.options.codeExpiration",
            target: "{that fluid.express.handler}.options.codeExpiration"
        }
    ],
    components: {
        get: {
            type: "fluid.express.user.reset.formRouter"
        },
        post: {
            type: "fluid.express.user.reset.post"
        }
    }
});
