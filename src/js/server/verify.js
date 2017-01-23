/*

  Provides the REST endpoint for `/api/user/verify/:code`, which is the second stage in the self-sign up process.  If a
  valid verification code is provided, the user's account will be flagged as verified.

  This API requires a verification code, which is generated using the `/api/user/signup` process and sent to the user
  via email.  The code can be resent by visiting `/api/user/verify/resend`.

 */
/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

// TODO: replace this with a writable dataSource
var request = require("request");

fluid.registerNamespace("gpii.express.user.verify.handler");

require("./lib/datasource");
require("./verify-resend");

gpii.express.user.verify.handler.checkVerificationCode = function (that, dataSourceResponse) {
    if (!dataSourceResponse || !dataSourceResponse[that.options.codeKey] || (that.options.request.params.code !== dataSourceResponse[that.options.codeKey])) {
        that.sendFinalResponse(401, { isError: true, message: "You must provide a valid verification code to use this interface."});
    }
    else {
        var updatedUserRecord = fluid.copy(dataSourceResponse);
        updatedUserRecord.verified = true;
        delete updatedUserRecord[that.options.codeKey];

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
                that.sendFinalResponse(200, { message: "Your account has been verified.  You can now log in."});
            }
        });
    }
};

fluid.defaults("gpii.express.user.verify.handler", {
    gradeNames: ["gpii.express.handler"],
    codeKey:    "{gpii.express.user.verify}.options.codeKey",
    urls:       "{gpii.express.user.verify}.options.urls",
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once it has been reviewed.
            type: "gpii.express.user.couchdb.read",
            options: {
                url: "{gpii.express.user.verify}.options.urls.read",
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                termMap: { code: "%code"},
                listeners: {
                    "onRead.checkVerificationCode": {
                        nameSpace: "gpii.express.user.verify",
                        funcName:  "gpii.express.user.verify.handler.checkVerificationCode",
                        args:      ["{gpii.express.handler}", "{arguments}.0"] // dataSource response
                    },
                    "onError.sendErrorResponse": {
                        func: "{gpii.express.user.verify.handler}.sendFinalResponse",
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
            funcName: "fluid.notImplemented"
        }
    }
});

fluid.registerNamespace("gpii.express.user.verify.handler.html");

gpii.express.user.verify.handler.html.sendFinalResponse = function (that, statusCode, body) {
    that.options.response.status(statusCode).render(that.options.templateKey, body);
};

fluid.defaults("gpii.express.user.verify.handler.html", {
    gradeNames:  ["gpii.express.user.verify.handler"],
    templateKey: "pages/verify",
    invokers: {
        sendFinalResponse: {
            funcName: "gpii.express.user.verify.handler.html.sendFinalResponse",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"] // statusCode, response
        }
    }
});

// The JSON handler just passes the response payload on to gpii.express.handler.sendResponse
fluid.defaults("gpii.express.user.verify.handler.json", {
    gradeNames: ["gpii.express.user.verify.handler"],
    invokers: {
        sendFinalResponse: {
            func: "{that}.sendResponse",
            args: ["{arguments}.0", "{arguments}.1"] // statusCode, response
        }
    }
});

fluid.defaults("gpii.express.user.verify", {
    gradeNames: ["gpii.express.router"],
    method:     "use",
    path:       "/verify",
    codeKey:    "verification_code",  // Must match the value in gpii.express.user.verify
    urls: {
        read: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     [ "%userDbUrl/_design/lookup/_view/byVerificationCode?key=\"%code\"", "{that}.options.couch"]
            }
        },
        write: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     [ "%userDbUrl/%id", "{that}.options.couch"]
            }
        }
    },
    components: {
        resendRouter: {
            type: "gpii.express.user.verify.resend"
        },
        mainRouter: {
            type: "gpii.express.middleware.contentAware",
            priority: "after:resendRouter",
            options: {
                path:   ["/:code", "/"],
                method: "get",
                handlers: {
                    text: {
                        contentType:   ["text/html", "text/plain"],
                        handlerGrades: ["gpii.express.user.verify.handler.html"]
                    },
                    json: {
                        contentType:   "application/json",
                        handlerGrades: ["gpii.express.user.verify.handler.json"]
                    }
                }
            }
        }
    }
});
