/*

    A grade that hides a `requestAware` router behind a schema validation layer, including all required HTML and JSON
    error handling.

 */
var fluid = require("infusion");

fluid.defaults("gpii.express.user.validationGatedRouter", {
    gradeNames:       ["gpii.express.router"],
    events: {
        onSchemasDereferenced: null
    },
    components: {
        validationMiddleware: {
            type: "gpii.schema.validationMiddleware",
            options: {
                priority:  "first",
                schemaKey: "{gpii.express.user.validationGatedRouter}.options.schemaKey",
                messages: {
                    error: "The information you provided is incomplete or incorrect.  Please check the following:"
                },
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.express.user.validationGatedRouter}.events.onSchemasDereferenced.fire"
                    }
                }
            }
        },
        // TODO:  Add a schema key for validation errors and add those headers here
        validationJsonMiddleware: {
            type: "gpii.express.middleware.error",
            options: {
                priority:    "after:validationMiddleware",
                // priority:          "after:validationHtmlErrorMiddleware",
                defaultStatusCode: 400
            }
        },
        // If we've made it this far, we don't need the above headers
        requestAwareMiddleware: {
            type: "gpii.express.middleware.requestAware",
            options: {
                handlerGrades: "{gpii.express.user.validationGatedRouter}.options.handlerGrades"
            }
        }
    }
});