(function (fluid) {
    "use strict";
    fluid.defaults("fluid.express.user.frontend.errorAwareForm", {
        gradeNames: ["fluid.schema.client.errorAwareForm"],
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
                type: "fluid.express.user.schemaHolder"
            }
        }
    });
})(fluid);
