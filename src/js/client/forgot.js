// Provide a front-end to allow users to request that their password be reset...
(function () {
    "use strict";
    fluid.defaults("fluid.express.user.frontend.forgot", {
        gradeNames: ["fluid.express.user.frontend.errorAwareForm"],
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
                type: "fluid.express.user.schemaHolder.forgot"
            }
        }
    });

    fluid.defaults("fluid.express.user.frontend.forgot.hasUserControls", {
        gradeNames: ["fluid.ul.hasUserControls", "fluid.express.user.frontend.forgot"]
    });
})(jQuery);
