(function (fluid) {
    "use strict";
    fluid.defaults("gpii.express.user.frontend.errorAwareForm", {
        gradeNames: ["gpii.schema.client.errorAwareForm"],
        //modelSchema: {},
        // The schema is a promise, which has been thankfully been resolved by the time we see it.
        // TODO: Obviously we need a better strategy to retrieve the holder's schema and use it as our modelSchema.
        modelSchema: {
            expander: {
                funcName: "fluid.get",
                args: ["@expand:{schemaHolder}.getSchema()", "value"]
            }
        },
        components: {
            schemaHolder: {
                type: "gpii.express.user.schemaHolder"
            }
        }
    });
})(fluid);
