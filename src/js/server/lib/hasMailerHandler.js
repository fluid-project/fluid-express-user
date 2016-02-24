/*

 `gpii.express.user.api.hasMailHandler` is an instance of `gpii.express.handler` that has an additional invoker to
 send outgoing mail.  The underlying mailer uses `gpii-handlebars` to render the content, and expects to be passed
 raw configuration data, which we generate using our data and rules, as follows:

     1. `mailOptions` is a map of valid configuration options for `nodemailer-smtp-transport`.  These options are
        generated using `options.rules.mailOptions`.

     2. `templateContext` represents data to expose to handlebars during template rendering.  This is generated using
        `options.rules.mailTemplateContext`.

 The transformation of both sets of rules uses the component itself as its source data, so you have access to any
 `option` data, all `model` data, and to the implicit `request` object.

To use this component, add it to your list of `gradeNames` and then call the `sendMessage` invoker either from code
or an invoker definition.

The user won't receive a response until the message has been sent.  If sending occurs without error, the contents of
`options.messages.success` will be sent to the end user.  If an error occurs, the contents of `options.messages.error`
will be sent instead.

Note that the mail output is sent using the mailer, and that you must have a `templateDirs` option and template keys set as
per that documentation.

 */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

require("gpii-express");

fluid.registerNamespace("gpii.express.user.api.hasMailHandler");

gpii.express.user.api.hasMailHandler.sendMessage = function (that) {
    var mailOptions     = fluid.model.transformWithRules(that, that.options.rules.mailOptions, {});
    var templateContext = fluid.model.transformWithRules(that, that.options.rules.mailTemplateContext, {});

    that.mailer.sendMessage(mailOptions, templateContext);
};

fluid.defaults("gpii.express.user.api.hasMailHandler", {
    gradeNames:   ["gpii.express.handler"],
    replyAddress: "noreply@ul.gpii.net",
    config:       "{gpii.express}.options.config",
    templateDirs: "{gpii.express.user.api}.options.templateDirs",
    messages: {
        success: "Email sent.",
        error:   "Email could not be sent.  Contact an administrator."
    },
    mergePolicy: {
        sources: "nomerge, noexpand"
    },
    rules: {
        mailOptions: {
            to:   "user.email", // You must set `that.user` before sending a message for this to be visible.
            from: "options.replyAddress"
        },
        mailTemplateContext: {
            app:  "options.config.app", // The express options pulled in above.  Allows us to pick up the app name, etc.
            user: "user" // You must set `that.user` before sending a message for this to be visible.
        }
    },
    components: {
        mailer: {
            type: "gpii.express.user.mailer.handlebars",
            options: {
                messages:        "{gpii.express.user.api.hasMailHandler}.options.messages",
                templateDirs:    "{gpii.express.user.api.hasMailHandler}.options.templateDirs",
                htmlTemplateKey: "{gpii.express.user.api.hasMailHandler}.options.templates.mail.html",
                textTemplateKey: "{gpii.express.user.api.hasMailHandler}.options.templates.mail.text",
                listeners: {
                    "onSuccess.sendResponse": {
                        func: "{gpii.express.user.api.hasMailHandler}.sendResponse",
                        args: [200, { ok: true, message: "{that}.options.messages.success"}]
                    },
                    "onError.sendResponse": {
                        func: "{gpii.express.user.api.hasMailHandler}.sendResponse",
                        args: [500, { ok: false, message: "{that}.options.messages.error"}]
                    },
                    // The error handler is passed the error and a text response.  Log the response.
                    "onError.log": {
                        funcName: "fluid.log",
                        args:     ["Error sending email:", "{arguments}.1"]
                    }
                }
            }

        }
    },
    invokers: {
        sendMessage: {
            funcName: "gpii.express.user.api.hasMailHandler.sendMessage",
            args:     ["{that}"]
        }
    }
});