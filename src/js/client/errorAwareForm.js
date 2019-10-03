(function (fluid) {
    "use strict";
    fluid.defaults("gpii.express.user.frontend.errorAwareForm", {
        gradeNames: ["gpii.schema.client.errorAwareForm"],
        resources: {
            schema: {
                promiseFunc: "{schemaHolder}.getSchema"
            }
        },
        modelSchema: "{that}.resources.schema.parsed",
        components: {
            schemaHolder: {
                type: "gpii.express.user.schemaHolder"
            }
        }
    });
})(fluid);
