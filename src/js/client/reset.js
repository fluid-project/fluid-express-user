// Provides a front-end to `/api/user/reset/:code`, which allows user to reset their password.  This is the second stage
// of the password reset process, and can only be used with a code generated using the "forgot password" form (see
// `/api/user/forgot`).
//
/* global fluid, jQuery */
(function () {
    "use strict";
    fluid.registerNamespace("gpii.express.user.frontend.reset");

    fluid.defaults("gpii.express.user.frontend.reset", {
        gradeNames: ["gpii.express.user.frontend.errorAwareForm"],
        ajaxOptions: {
            type:    "POST",
            url:     {
                expander: {
                    funcName: "fluid.stringTemplate",
                    args:     ["/api/user/reset/%code", { code: "{that}.model.code"}]
                }
            },
            json:     true,
            dataType: "json"
        },
        model: {
            code: "{that}.options.req.params.code"
        },
        rules: {
            successResponseToModel: {
                // TODO:  Review once https://issues.gpii.net/browse/GPII-1587 is resolved
                successMessage: {
                    literalValue: "Your password has been reset."
                }
            }
        },
        templateKeys: {
            success: "common-success",
            initial: "reset-viewport"
        },
        selectors: {
            initial:  ".reset-viewport",
            success:  ".reset-success",
            error:    ".reset-error",
            password: "input[name='password']",
            confirm:  "input[name='confirm']",
            submit:   ".reset-button"
        },
        bindings: {
            "password": "password",
            "confirm":  "confirm"
        },
        components: {
            schemaHolder: {
                type: "gpii.express.user.schemaHolder.reset"
            }
        }
    });
})(jQuery);
