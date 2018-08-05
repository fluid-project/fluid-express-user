/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.express.user.login.post.handler");

require("gpii-handlebars");
require("gpii-json-schema");

require("./lib/datasource");
require("./lib/password");

fluid.registerNamespace("gpii.express.user.login");

gpii.express.user.login.post.handler.verifyPassword = function (that, utils, request, response) {
    utils.unlockUser(request.body.username, request.body.password).then(
        function (data) {
            var user = fluid.model.transformWithRules(data, that.options.rules.user);
            that.options.request.session[that.options.sessionKey] = user;
            that.sendResponse(200, { message: that.options.messages.success, user: user});
        },
        function (err, data) {
            that.sendResponse(401, { isError: true, message: that.options.messages.failure});
        }
    );
};

fluid.defaults("gpii.express.user.login.post.handler", {
    gradeNames: ["gpii.express.handler"],
    sessionKey: "_gpii_user",
    messages: {
        success: "You have successfully logged in.",
        failure: "Invalid username or password."
    },
    url:    {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     [ "%userDbUrl/_design/lookup/_view/byUsernameOrEmail?key=\"%username\"", "{that}.options.couch"]
        }
    },
    method: "post",
    invokers: {
        handleRequest: {
            funcName: "gpii.express.user.login.post.handler.verifyPassword",
            args: ["{that}", "{gpii.express.user.utils}", "{that}.options.request", "{that}.options.response"]
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "gpii.express.user.couchdb.read",
            options: {
                url: "{gpii.express.user.login.post.handler}.options.url",
                rules: {
                    read: {
                        "":         "rows.0.value",
                        "username": "rows.0.value.name"
                    }
                },
                termMap: { username: "%username"},
                listeners: {
                    "onRead.verifyPassword": {
                        nameSpace: "gpii.express.user.login",
                        funcName:  "gpii.express.user.login.post.handler.verifyPassword",
                        args:      ["{gpii.express.user.login.post.handler}", "{arguments}.0", "{arguments}"]
                    },
                    "onError.sendErrorResponse": {
                        func: "{gpii.express.user.login.post.handler}.sendResponse",
                        args: [500, { isError: true, message: "Error checking username and password."}]
                    }
                }
            }
        }
    }
});

fluid.defaults("gpii.express.user.login.post", {
    gradeNames:    ["gpii.express.user.validationGatedRouter"],
    path:          "/",
    method:        "post",
    schemaKey:     "user-login.json",
    handlerGrades: ["gpii.express.user.login.post.handler"]
});

fluid.defaults("gpii.express.user.login", {
    gradeNames: ["gpii.express.router"],
    path:       "/login",
    events: {
        onSchemasDereferenced: null
    },
    rules: {
        user: {
            "username": "name", // Default configuration is designed for CouchDB and express-couchUser field naming conventions.
            "email":    "email",
            "roles":    "roles"
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
                namespace: "getRouter",
                templateKey: "pages/login",
                rules: {
                    contextToExpose: {
                        model: {
                            user: "req.session._gpii_user"
                        }
                    }
                }
            }
        },
        postRouter: {
            type: "gpii.express.user.login.post",
            options: {
                priority: "after:getRouter",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.login}.events.onSchemasDereferenced.fire"
                    }
                }
            }
        }
    }
});
