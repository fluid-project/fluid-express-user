// Present a standard set of user controls with login/logout/profile links

/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.user.frontend.controls");

    gpii.express.user.frontend.controls.toggleMenu = function (that) {
        var toggle = that.locate("toggle");
        var menu   = that.locate("menu");

        if ($(menu).is(":hidden")) {
            menu.show();
            menu.focus();
        }
        else {
            menu.hide();
            toggle.focus();
        }
    };

    fluid.defaults("gpii.express.user.frontend.controls", {
        gradeNames: ["gpii.handlebars.templateFormControl"],
        container:  ".controls-viewport",
        ajaxOptions: {
            type:     "GET",
            url:      "/api/user/logout"
        },
        templates: {
            initial: "controls-viewport",
            success: "common-success",
            error:   "common-error"
        },
        rules: {
            modelToRequestPayload: {
                "": { literalValue: undefined }
            },
            successResponseToModel: {
                // TODO:  Refactor once https://issues.gpii.net/browse/GPII-1587 is resolved
                "":        "notfound",
                user: {
                    literalValue: false
                }
            }
        },
        selectors: {
            initial:  "",
            success:  ".controls-message",
            error:    ".controls-message",
            controls: ".user-controls",
            menu:     ".user-menu",
            logout:   ".user-menu-logout",
            toggle:   ".user-controls-toggle"
        },
        model: {
            user: null
        },
        modelListeners: {
            user: {
                func:          "{that}.renderInitialMarkup",
                excludeSource: "init"
            }
        },
        invokers: {
            toggleMenu: {
                funcName: "gpii.express.user.frontend.controls.toggleMenu",
                args:     [ "{that}"]
            }
        },
        listeners: {
            "onMarkupRendered.bindLogoutClick": {
                "this":   "{that}.dom.logout",
                "method": "click",
                "args":   "{that}.submitForm"
            },
            "onMarkupRendered.bindLogoutKeys": {
                "listener": "fluid.activatable",
                "args":     ["{that}.dom.logout", "{that}.submitForm"]
            },
            "onMarkupRendered.bindToggleClick": {
                "this":   "{that}.dom.toggle",
                "method": "click",
                "args":   "{that}.toggleMenu"
            },
            "onMarkupRendered.bindToggleKeys": {
                "listener": "fluid.activatable",
                "args":     ["{that}.dom.toggle", "{that}.toggleMenu"]
            },
            "onMarkupRendered.makeMenuItemsSelectable": {
                "listener": "fluid.selectable",
                "args":     ["{that}.dom.menu", { onSelect: "{that}.tattle", onLeaveContainer: "{that}.toggleMenu"}]
            }
        }
    });

    // A convenience gradeName to make any component aware of these controls.
    fluid.defaults("gpii.ul.hasUserControls", {
        gradeNames: ["fluid.modelComponent"],
        components: {
            controls: {
                type:      "gpii.express.user.frontend.controls",
                container: ".controls-viewport",
                options: {
                    model: {
                        user: "{hasUserControls}.model.user"
                    }
                }
            }
        }
    });
})(jQuery);
