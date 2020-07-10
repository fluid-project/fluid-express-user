(function (fluid) {
    "use strict";
    fluid.defaults("gpii.express.user.frontend.errorAwareForm", {
        gradeNames: ["gpii.schema.client.errorAwareForm"],
        resources: {
            modelSchema: {
                promiseFunc: "{schemaHolder}.generateSchema"
            }
        },
        modelSchema: "{that}.model.modelSchema",
        model: {
            modelSchema: "{that}.resources.modelSchema.parsed"
        },
        components: {
            schemaHolder: {
                type: "gpii.express.user.schemaHolder"
            }
        }
    });
})(fluid);
