// provide a front-end to /api/user/verify/resend
(function () {
    "use strict";

    fluid.registerNamespace("fluid.express.user.frontend.resend");

    fluid.defaults("fluid.express.user.frontend.resend", {
        gradeNames: ["fluid.express.user.frontend.errorAwareForm"],
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
                type: "fluid.express.user.schemaHolder.resend"
            }
        }
    });
})(jQuery);
