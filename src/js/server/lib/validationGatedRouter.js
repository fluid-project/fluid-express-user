/*

    A grade that hides a `requestAware` router behind a schema validation layer, including all required HTML and JSON
    error handling.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%fluid-json-schema");
fluid.require("%fluid-express-user");
require("../../common/schemaHolders.js");

fluid.defaults("fluid.express.user.validationMiddleware", {
    gradeNames: ["fluid.schema.validationMiddleware", "fluid.resourceLoader"],
    resources: {
        schema: {
            promiseFunc: "{fluid.express.user.schemaHolder}.generateSchema"
        }
    },
    model: {
        inputSchema: "{that}.resources.schema.parsed"
    },
    messageDirs: {
        user: "%fluid-express-user/src/messages"
    },
    invokers: {
        middleware: {
            funcName: "fluid.schema.validationMiddleware.rejectOrForward",
            args:     ["{fluid.schema.validator}", "{that}", "{that}.model.inputSchema", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // globalValidator, validationMiddleware, schema, request, response, next
        }
    }
});

fluid.defaults("fluid.express.user.validationGatedRouter", {
    gradeNames: ["fluid.express.router"],
    components: {
        schemaHolder: {
            type: "fluid.express.user.schemaHolder"
        },
        validationMiddleware: {
            type: "fluid.express.user.validationMiddleware",
            options: {
                priority:  "first"
            }
        },
        requestAwareMiddleware: {
            type: "fluid.express.middleware.requestAware",
            options: {
                priority: "after:validationMiddleware",
                handlerGrades: "{fluid.express.user.validationGatedRouter}.options.handlerGrades"
            }
        }
    }
});
