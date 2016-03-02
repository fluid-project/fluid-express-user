"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.express.user.api.login.post.handler");

require("gpii-handlebars");
require("gpii-json-schema");

require("./lib/datasource");
require("./lib/password");

fluid.registerNamespace("gpii.express.user.api.login");

gpii.express.user.api.login.post.handler.verifyPassword = function (that, response) {
    // The user exists, so we can check the supplied password against our records.
    if (response.username) {
        var encodedPassword = gpii.express.user.password.encode(that.request.body.password, response.salt, response.iterations, response.keyLength, response.digest);
        if (encodedPassword === response.derived_key) {
            // Transform the raw response to ensure that nothing sensitive is exposed to the user
            var user = fluid.model.transformWithRules(response, that.options.rules.user);
            that.request.session[that.options.sessionKey] = user;
            that.sendResponse(200, { ok: true, message: that.options.messages.success, user: user});
        }
        // The password didn't match.
        else {
            that.sendResponse(401, { ok: false, message: that.options.messages.failure});
        }
    }
    // The user doesn't exist, but we send the same failure message to avoid giving intruders a way to validate usernames.
    else {
        that.sendResponse(401, { ok: false, message: that.options.messages.failure});
    }
};

fluid.defaults("gpii.express.user.api.login.post.handler", {
    gradeNames: ["gpii.schema.handler"],
    schemaKey:  "message-core.json",
    schemaUrl:  "/schemas/message-core",
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
            func: "{reader}.get",
            args: ["{that}.request.body"]
        }
    },
    components: {
        reader: {
            // TODO:  Replace with the new "asymmetric" dataSource once that code has been reviewed
            type: "gpii.express.user.couchdb.read",
            options: {
                url: "{gpii.express.user.api.login.post.handler}.options.url",
                rules: {
                    read: {
                        "":         "rows.0.value",
                        "username": "rows.0.value.name"
                    }
                },
                termMap: { username: "%username"},
                listeners: {
                    "onRead.verifyPassword": {
                        nameSpace: "gpii.express.user.api.login",
                        funcName:  "gpii.express.user.api.login.post.handler.verifyPassword",
                        args:      ["{gpii.express.user.api.login.post.handler}", "{arguments}.0", "{arguments}"]
                    },
                    "onError.sendErrorResponse": {
                        func: "{gpii.express.user.api.login.post.handler}.sendResponse",
                        args: [500, { ok: false, message: "Error checking username and password."}]
                    }
                }
            }
        }
    }
});

fluid.defaults("gpii.express.user.api.login.post", {
    gradeNames: ["gpii.schema.middleware.requestAware.router"],
    path:       "/",
    method:     "post",
    handlerGrades: ["gpii.express.user.api.login.post.handler"],
    schemaPath: "%gpii-express-user/src/schemas",
    schemaKey:  "user-login.json"
});

fluid.defaults("gpii.express.user.api.login", {
    gradeNames: ["gpii.express.router.passthrough"],
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
            type: "gpii.express.user.api.login.post"
        }
    }
});