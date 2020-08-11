/*

  Provides the REST endpoint for `/api/user/verify/:code`, which is the second stage in the self-sign up process.  If a
  valid verification code is provided, the user's account will be flagged as verified.

  This API requires a verification code, which is generated using the `/api/user/signup` process and sent to the user
  via email.  The code can be resent by visiting `/api/user/verify/resend`.

 */
/* eslint-env node */
"use strict";
var fluid  = require("infusion");

// TODO: replace this with a writable dataSource
var request = require("request");

fluid.registerNamespace("fluid.express.user.verify.handler");

require("./lib/datasource");
require("./verify-resend");

fluid.express.user.verify.handler.checkVerificationCode = function (that, dataSourceResponse) {
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

fluid.defaults("fluid.express.user.verify.handler", {
    gradeNames: ["fluid.express.handler"],
    codeKey:    "{fluid.express.user.verify}.options.codeKey",
    urls:       "{fluid.express.user.verify}.options.urls",
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once it has been reviewed.
            type: "fluid.express.user.couchdb.read",
            options: {
                url: "{fluid.express.user.verify}.options.urls.read",
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                termMap: { code: "%code"},
                listeners: {
                    "onRead.checkVerificationCode": {
                        nameSpace: "fluid.express.user.verify",
                        funcName:  "fluid.express.user.verify.handler.checkVerificationCode",
                        args:      ["{fluid.express.handler}", "{arguments}.0"] // dataSource response
                    },
                    "onError.sendErrorResponse": {
                        func: "{fluid.express.user.verify.handler}.sendFinalResponse",
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

fluid.registerNamespace("fluid.express.user.verify.handler.html");

fluid.express.user.verify.handler.html.sendFinalResponse = function (that, statusCode, body) {
    that.options.response.status(statusCode).render(that.options.templateKey, body);
};

fluid.defaults("fluid.express.user.verify.handler.html", {
    gradeNames:  ["fluid.express.user.verify.handler"],
    templateKey: "pages/verify",
    invokers: {
        sendFinalResponse: {
            funcName: "fluid.express.user.verify.handler.html.sendFinalResponse",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"] // statusCode, response
        }
    }
});

// The JSON handler just passes the response payload on to fluid.express.handler.sendResponse
fluid.defaults("fluid.express.user.verify.handler.json", {
    gradeNames: ["fluid.express.user.verify.handler"],
    invokers: {
        sendFinalResponse: {
            func: "{that}.sendResponse",
            args: ["{arguments}.0", "{arguments}.1"] // statusCode, response
        }
    }
});

fluid.defaults("fluid.express.user.verify", {
    gradeNames: ["fluid.express.router"],
    method:     "use",
    path:       "/verify",
    codeKey:    "verification_code",  // Must match the value in fluid.express.user.verify
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
            type: "fluid.express.user.verify.resend"
        },
        mainRouter: {
            type: "fluid.express.middleware.contentAware",
            options: {
                priority: "after:resendRouter",
                path:   ["/:code", "/"],
                method: "get",
                handlers: {
                    text: {
                        contentType:   ["text/html", "text/plain"],
                        handlerGrades: ["fluid.express.user.verify.handler.html"]
                    },
                    json: {
                        contentType:   "application/json",
                        handlerGrades: ["fluid.express.user.verify.handler.json"]
                    }
                }
            }
        }
    }
});
