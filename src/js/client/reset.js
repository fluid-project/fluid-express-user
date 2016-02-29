// Provides a front-end to `/api/user/reset/:code`, which allows user to reset their password.  This is the second stage
// of the password reset process, and can only be used with a code generated using the "forgot password" form (see
// `/api/user/forgot`).
//
/* global fluid, jQuery */
(function () {
    "use strict";
    fluid.registerNamespace("gpii.express.user.frontend.reset");

    fluid.defaults("gpii.express.user.frontend.reset", {
        gradeNames: ["gpii.schemas.client.errorAwareForm.clientSideValidation"],
        schemaKey:  "user-reset.json",
        ajaxOptions: {
            type:    "POST",
            url:     {
                expander: {
                    funcName: "fluid.stringTemplate",
                    args:     ["/api/user/reset/%code", { code: "{that}.model.code"}]
                }
            }
        },
        model: {
            code: "{that}.options.req.params.code"
        },
        rules: {
            successResponseToModel: {
                successMessage: {
                    literalValue: "Your password has been reset."
                }
            }
        },
        templates: {
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
        }
    });
})(jQuery);