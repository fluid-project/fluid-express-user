// provide a front-end to /api/user/verify/resend
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.registerNamespace("gpii.express.user.frontend.resend");

    fluid.defaults("gpii.express.user.frontend.resend", {
        gradeNames: ["gpii.express.user.frontend.errorAwareForm"],
        templateKeys: {
            initial: "resend-viewport",
            error:   "common-error",
            success: "common-success"
        },
        model: {
            user: null
        },
        ajaxOptions: {
            url:      "/api/user/verify/resend",
            method:   "POST",
            json:     true,
            dataType: "json"
        },
        rules: {
            modelToRequestPayload: {
                // TODO:  Refactor once https://issues.gpii.net/browse/GPII-1587 is resolved
                "":    "notfound", // Required to clear out the default rules from `templateFormControl`
                email: "email"
            }
        },
        bindings: {
            email: "email"
        },
        selectors: {
            initial:  ".resend-viewport",
            form:     ".resend-form",
            success:  ".resend-success",
            error:    ".resend-error",
            email:    "input[name='email']"
        },
        components: {
            schemaHolder: {
                type: "gpii.express.user.schemaHolder.resend"
            }
        }
    });
})(jQuery);
