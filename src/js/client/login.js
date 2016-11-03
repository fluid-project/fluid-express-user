// provide a front-end to /api/user/login
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.express.user.frontend.login");

        // If the user controls are used to log out, we have to manually clear the success message.
    // If we delegate this to the controls component, it might clobber success messages for things other than the login.
    gpii.express.user.frontend.login.checkAndClearSuccess = function (that) {
        if (!that.model.user || !that.model.user.username) {
            that.applier.change("successMessage", null);
            that.renderInitialMarkup();
        }
    };

    fluid.defaults("gpii.express.user.frontend.login", {
        gradeNames: ["gpii.schemas.client.errorAwareForm"],
        templates: {
            initial: "login-viewport",
            success: "common-success"
        },
        model: {
            user: null
        },
        schemaKey: "user-login.json",
        ajaxOptions: {
            url:      "/api/user/login",
            method:   "POST",
            json:     true,
            dataType: "json"
        },
        modelListeners: {
            "user.refresh": [{
                funcName:      "gpii.express.user.frontend.login.checkAndClearSuccess",
                args:          ["{that}"],
                excludeSource: "init"
            }]
        },
        components: {
            success: {
                options: {
                    listeners: {
                        "onCreate.renderMarkup": {
                            func: "{that}.renderInitialMarkup"
                        }
                    }
                }
            },
            error: {
                options: {
                    listeners: {
                        "onCreate.renderMarkup": {
                            func: "{that}.renderInitialMarkup"
                        }
                    }
                }
            }
        },
        rules: {
            modelToRequestPayload: {
                // TODO:  Refactor once https://issues.gpii.net/browse/GPII-1587 is resolved
                "":       "notfound", // Required to clear out the default rules from `templateFormControl`
                username: "username",
                password: "password"
            },
            successResponseToModel: {
                "": "notfound",
                fieldErrors:  { literalValue: [] },
                errorMessage: { literalValue: false },
                successMessage: "responseJSON.message",
                user: "responseJSON.user",
                password: {
                    literalValue: ""
                }
            }
        },
        bindings: {
            username: "username",
            password: "password"
        },
        selectors: {
            initial:  ".login-viewport",
            form:     ".login-form",
            success:  ".login-success",
            error:    ".login-error",
            username: "input[name='username']",
            password: "input[name='password']"
        }
    });
})(jQuery);
