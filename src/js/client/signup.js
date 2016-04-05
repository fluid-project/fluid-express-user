// provide a front-end to /api/user/signup
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.defaults("gpii.express.user.frontend.signup", {
        gradeNames: ["gpii.schemas.client.errorAwareForm.clientSideValidation"],
        schemaKey: "user-signup.json",
        ajaxOptions: {
            type:   "POST",
            url:    "/api/user/signup",
            json:   true
        },
        rules: {
            // TODO:  Review once https://issues.gpii.net/browse/GPII-1587 is resolved
            modelToRequestPayload: {
                name:     "username",
                password: "password",
                email:    "email",
                // Needed to ensure that our account can be created.
                roles: {
                    literalValue: ["user"]
                }
            },
            successResponseToModel: {
                successMessage: {
                    literalValue: "You have successfully created an account.  Check your email for further instructions."
                },
                errorMessage: {
                    literalValue: null
                }
            }
        },
        templates: {
            initial: "signup-viewport",
            success: "common-success"
        },
        selectors: {
            initial:  ".signup-viewport",
            success:  ".signup-success",
            error:    ".signup-error",
            submit:   ".signup-submit",
            username: "input[name='username']",
            email:    "input[name='email']",
            password: "input[name='password']",
            confirm:  "input[name='confirm']"
        },
        bindings: {
            "username": "username",
            "email":    "email",
            "password": "password",
            "confirm":  "confirm"
        }
    });

    fluid.defaults("gpii.express.user.frontend.signup.hasUserControls", {
        gradeNames: ["gpii.express.user.frontend.signup", "gpii.ul.hasUserControls"]
    });
})(jQuery);