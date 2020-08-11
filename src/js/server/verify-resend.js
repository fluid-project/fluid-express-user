/* eslint-env node */
/*

  A router endpoint to allow resending of verification codes per [CTR-104](https://issues.fluid.net/browse/CTR-104).

  Consists of two parts:
  1. A GET handler that returns a form that can be used to request a reset.
  2. A POST handler that checks for the existing of a verification code for the given user and resends it if found.
    a. If the request headers indicate that JSON data is accepted, a JSON receipt is sent.
    b. If the request headers indicate that text data is accepted, a text receipt is sent.

  // TODO:  Update this to send the verification form for a GET and migrate the other bits to just the POST side.
 */
"use strict";
var fluid = require("infusion");

require("fluid-handlebars");
require("./lib/withMailHandler");

fluid.registerNamespace("fluid.express.user.verify.resend.handler");

fluid.express.user.verify.resend.handler.getVerificationCode = function (that, user) {
    if (!user || !user.username) {
        that.sendFinalResponse(404, { isError: true, message: "I couldn't find an account that matches the email address you provided."});
    }
    else if (user.verified) {
        that.sendFinalResponse(200, { message: "Your account has already been verified."});
    }
    else if (!user.verification_code) {
        that.sendFinalResponse(500, { isError: true, message: "Cannot retrieve verification code.  Contact an administrator."});
    }
    else {
        that.user = user;
        that.sendMessage();
    }
};

fluid.defaults("fluid.express.user.verify.resend.handler", {
    gradeNames: ["fluid.express.user.withMailHandler"],
    templates: {
        mail: {
            text:  "email-verify-text",
            html:  "email-verify-html"
        }
    },
    members: {
        user: null
    },
    rules: {
        mailOptions: {
            subject: { literalValue: "Please verify your account..." }
        }
    },
    invokers: {
        handleRequest: {
            func: "{reader}.get",
            args: ["{that}.options.request.body"]
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "fluid.express.user.couchdb.read",
            options: {
                url:     "{fluid.express.user.verify.resend}.options.urls.read",
                rules: {
                    read: {
                        "": "rows.0.value"
                    }
                },
                termMap: { "email": "%email" },
                listeners: {
                    "onRead.getVerificationCode": {
                        funcName: "fluid.express.user.verify.resend.handler.getVerificationCode",
                        args:     ["{fluid.express.user.verify.resend.handler}", "{arguments}.0"]
                    }
                }
            }
        }
    }
});

fluid.registerNamespace("fluid.express.user.verify.resend.handler.html");

fluid.express.user.verify.resend.handler.html.sendFinalResponse = function (that, statusCode, context) {
    that.options.response.status(statusCode).render(that.options.templateKey, context);
};

fluid.defaults("fluid.express.user.verify.resend.handler.html", {
    gradeNames: ["fluid.express.user.verify.resend.handler"],
    templateKey: "{fluid.express.user.verify.resend}.options.templates.html",
    invokers: {
        sendFinalResponse: {
            funcName: "fluid.express.user.verify.resend.handler.text.sendFinalResponse",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"] // status code, template context
        }
    }
});

fluid.defaults("fluid.express.user.verify.resend.handler.json", {
    gradeNames: ["fluid.express.user.verify.resend.handler"],
    invokers: {
        sendFinalResponse: {
            func: "{that}.sendResponse",
            args: ["{arguments}.0", "{arguments}.1"] // statusCode, message body
        }
    }
});

fluid.defaults("fluid.express.user.verify.resend", {
    gradeNames: ["fluid.express.router"],
    namespace:  "resend", // Namespace to allow other routers to put themselves in the chain before or after us.
    path:       "/resend",
    method:     "use",
    templateDirs: "{fluid.express.user.api}.options.templateDirs",
    urls: {
        read: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["%userDbUrl/_design/lookup/_view/byUsernameOrEmail?key=\"%email\"", "{that}.options.couch"]
            }
        }
    },
    components: {
        postRouter: {
            type: "fluid.express.middleware.contentAware",
            options: {
                path: ["/"],
                templates: {
                    html: "pages/verify-resend-receipt"
                },
                handlers: {
                    json: {
                        contentType:   "application/json",
                        handlerGrades: ["fluid.express.user.verify.resend.handler.json"]
                    },
                    text: {
                        contentType:   ["text/html", "text/plain"],
                        handlerGrades: ["fluid.express.user.verify.resend.handler.html"]
                    }
                },
                method: "post"
            }
        },
        formRouter: {
            type: "fluid.express.singleTemplateMiddleware",
            options: {
                templateKey: "pages/verify-resend",
                method:      "get"
            }
        }
    }
});
