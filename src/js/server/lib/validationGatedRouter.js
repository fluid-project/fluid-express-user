/*

    A grade that hides a `requestAware` router behind a schema validation layer, including all required HTML and JSON
    error handling.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%gpii-json-schema");
fluid.require("%gpii-express-user");
require("../../common/schemaHolders.js");

fluid.defaults("gpii.express.user.validationMiddleware", {
    gradeNames: ["gpii.schema.validationMiddleware", "fluid.resourceLoader"],
    resources: {
        schema: {
            promiseFunc: "{gpii.express.user.schemaHolder}.getSchema"
        }
    },
    inputSchema: "{that}.resources.schema.parsed",
    messageDirs: {
        user: "%gpii-express-user/src/messages"
    },
    invokers: {
        middleware: {
            funcName: "gpii.schema.validationMiddleware.rejectOrForward",
            args:     ["{gpii.schema.validator}", "{that}", "{that}.inputSchema", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // globalValidator, validationMiddleware, schema, request, response, next
        }
    }
});

fluid.defaults("gpii.express.user.validationGatedRouter", {
    gradeNames: ["gpii.express.router"],
    components: {
        schemaHolder: {
            type: "gpii.express.user.schemaHolder"
        },
        validationMiddleware: {
            type: "gpii.express.user.validationMiddleware",
            options: {
                priority:  "first"
            }
        },
        requestAwareMiddleware: {
            type: "gpii.express.middleware.requestAware",
            options: {
                priority: "after:validationMiddleware",
                handlerGrades: "{gpii.express.user.validationGatedRouter}.options.handlerGrades"
            }
        }
    }
});
