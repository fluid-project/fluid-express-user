/*

    A grade that hides a `requestAware` router behind a schema validation layer, including all required HTML and JSON
    error handling.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%gpii-json-schema/src/js/common/validation-errors.js");
require("../../common/schemaHolders.js");
require("../../common/messages.js");

fluid.defaults("gpii.express.user.validationGatedRouter", {
    gradeNames: ["gpii.express.router"],
    messageBundles: ["gpii.schema.messages.validationErrors", "gpii.express.user.messages.validation"],
    mergePolicy: {
        messageBundles: "nomerge"
    },
    components: {
        schemaHolder: {
            type: "gpii.express.user.schemaHolder"
        },
        validationMiddleware: {
            type: "gpii.schema.validationMiddleware",
            options: {
                priority:  "first",
                // The schema is a promise, which has been thankfully been resolved by the time we see it.
                // TODO: Obviously we need a better strategy to retrieve the holder's schema and use it as our modelSchema.
                inputSchema: {
                    expander: {
                        funcName: "fluid.get",
                        args: ["@expand:{schemaHolder}.getSchema()", "value"]
                    }
                },
                invokers: {
                    middleware: {
                        funcName: "gpii.schema.validationMiddleware.rejectOrForward",
                        args:     ["{gpii.schema.validator}", "{that}", "{that}.options.inputSchema", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // validatorComponent, schemaMiddlewareComponent, schema, req, res, next
                    }
                },
                model: {
                    messages: "@expand:gpii.express.user.messages.mergeMessages({gpii.express.user.validationGatedRouter}.options.messageBundles)"
                }
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
