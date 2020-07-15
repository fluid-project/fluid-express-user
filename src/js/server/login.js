/* eslint-env node */
"use strict";
var fluid  = require("infusion");

fluid.registerNamespace("fluid.express.user.login.post.handler");

require("fluid-handlebars");
require("fluid-json-schema");

require("./lib/datasource");
require("./lib/password");

fluid.registerNamespace("fluid.express.user.login");

fluid.express.user.login.post.handler.verifyPassword = function (that, utils, request) {
    utils.unlockUser(request.body.username, request.body.password).then(
        function (data) {
            var user = fluid.model.transformWithRules(data, that.options.rules.user);
            that.options.request.session[that.options.sessionKey] = user;
            that.sendResponse(200, { message: that.options.messages.success, user: user});
        },
        function () {
            that.sendResponse(401, { isError: true, message: that.options.messages.failure});
        }
    );
};

fluid.defaults("fluid.express.user.login.post.handler", {
    gradeNames: ["fluid.express.handler"],
    sessionKey: "_fluid_user",
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
            funcName: "fluid.express.user.login.post.handler.verifyPassword",
            args: ["{that}", "{fluid.express.user.utils}", "{that}.options.request"]
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "fluid.express.user.couchdb.read",
            options: {
                url: "{fluid.express.user.login.post.handler}.options.url",
                rules: {
                    read: {
                        "":         "rows.0.value",
                        "username": "rows.0.value.name"
                    }
                },
                termMap: { username: "%username"},
                listeners: {
                    "onRead.verifyPassword": {
                        nameSpace: "fluid.express.user.login",
                        funcName:  "fluid.express.user.login.post.handler.verifyPassword",
                        args:      ["{fluid.express.user.login.post.handler}", "{arguments}.0", "{arguments}"]
                    },
                    "onError.sendErrorResponse": {
                        func: "{fluid.express.user.login.post.handler}.sendResponse",
                        args: [500, { isError: true, message: "Error checking username and password."}]
                    }
                }
            }
        }
    }
});

fluid.defaults("fluid.express.user.login.post", {
    gradeNames:    ["fluid.express.user.validationGatedRouter"],
    path:          "/",
    method:        "post",
    handlerGrades: ["fluid.express.user.login.post.handler"],
    components: {
        schemaHolder: {
            type: "fluid.express.user.schemaHolder.login"
        }
    }
});

fluid.defaults("fluid.express.user.login", {
    gradeNames: ["fluid.express.router"],
    path:       "/login",
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
                namespace: "getRouter",
                templateKey: "pages/login",
                rules: {
                    contextToExpose: {
                        model: {
                            user: "req.session._fluid_user"
                        }
                    }
                }
            }
        },
        postRouter: {
            type: "fluid.express.user.login.post",
            options: {
                priority: "after:getRouter"
            }
        }
    }
});
