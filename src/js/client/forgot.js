// Provide a front-end to allow users to request that their password be reset...
/* global fluid, jQuery */
(function () {
    "use strict";
    fluid.defaults("gpii.express.user.frontend.forgot", {
        gradeNames: ["gpii.express.user.frontend.errorAwareForm"],
        ajaxOptions: {
            type: "POST",
            url:  "/api/user/forgot"
        },
        model: {
            email: ""
        },
        selectors: {
            initial: ".forgot-viewport",
            error:   ".forgot-error",
            success: ".forgot-success",
            submit:  ".forgot-button",
            email:    "input[name='email']"
        },
        bindings: {
            "email": "email"
        },
        templateKeys: {
            "initial": "forgot-viewport",
            "success": "success"
        },
        components: {
            schemaHolder: {
                type: "gpii.express.user.schemaHolder.forgot"
            }
        }
    });

    fluid.defaults("gpii.express.user.frontend.forgot.hasUserControls", {
        gradeNames: ["gpii.ul.hasUserControls", "gpii.express.user.frontend.forgot"]
    });
})(jQuery);
