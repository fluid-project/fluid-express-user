// provide a front-end to /api/user/signup
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.defaults("fluid.express.user.frontend.signup", {
        gradeNames: ["fluid.express.user.frontend.errorAwareForm"],
        ajaxOptions: {
            type:   "POST",
            url:    "/api/user/signup",
            json:   true
        },
        rules: {
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
                fieldErrors:  { literalValue: [] },
                errorMessage: { literalValue: false },
                successMessage: {
                    literalValue: "You have successfully created an account.  Check your email for further instructions."
                }
            }
        },
        templateKeys: {
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
        },
        components: {
            schemaHolder: {
                type: "fluid.express.user.schemaHolder.signup"
            }
        }
    });

    fluid.defaults("fluid.express.user.frontend.signup.hasUserControls", {
        gradeNames: ["fluid.express.user.frontend.signup", "fluid.ul.hasUserControls"]
    });
})(jQuery);
