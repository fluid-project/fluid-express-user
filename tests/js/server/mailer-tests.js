// Testing the mail handling, including support for handlebars templates
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var fs           = require("fs");
var jqUnit       = require("node-jqunit");
var simpleParser = require("mailparser").simpleParser;

require("gpii-mail-test");
var kettle = require("kettle");
kettle.loadTestingSupport();

require("../../../src/js/server/lib/mailer");

var express = require("gpii-express");
express.loadTestingSupport();

fluid.registerNamespace("gpii.mailer.tests");

gpii.mailer.tests.checkResponse = function (mailServerComponent, expected) {
    var mailContent = fs.readFileSync(mailServerComponent.currentMessageFile, "utf8");

    jqUnit.assertTrue("There should be mail content...", mailContent && mailContent.length > 0);

    if (expected) {
        jqUnit.stop();
        simpleParser(mailContent).then(
            function (message) {
                jqUnit.start();
                jqUnit.assertLeftHand("The message sent should be as expected.", expected, message);
            },
            function (error) {
                jqUnit.start();
                jqUnit.fail("There should be no mail errors: ", error);
            }
        );
    }
};

fluid.defaults("gpii.mailer.tests.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder"],
    expected: {
        textMessage: {
            from: {
                value: [ { address: "sample@localhost", name: "" }],
                html: "<span class=\"mp_address_group\"><a href=\"mailto:sample@localhost\" class=\"mp_address_email\">sample@localhost</a></span>",
                text: "sample@localhost"
            },
            to: {
                value: [ { address: "other@localhost",  name: "" }],
                html: "<span class=\"mp_address_group\"><a href=\"mailto:other@localhost\" class=\"mp_address_email\">other@localhost</a></span>",
                text: "other@localhost"
            },
            subject: "sample text message...",
            text:    "This is a sample message body."
        },
        templateMessage: {
            from: {
                value: [ { address: "sample@localhost", name: "" }],
                html: "<span class=\"mp_address_group\"><a href=\"mailto:sample@localhost\" class=\"mp_address_email\">sample@localhost</a></span>",
                text: "sample@localhost"
            },
            to: {
                value: [ { address: "other@localhost",  name: "" }],
                html: "<span class=\"mp_address_group\"><a href=\"mailto:other@localhost\" class=\"mp_address_email\">other@localhost</a></span>",
                text: "other@localhost"
            },
            subject: "sample template message...",
            text:    "I am convincingly and customizably happy to be writing you.",
            html:    "I am convincingly and customizably <p><em>happy</em></p>\n to be writing you."
        }
    },
    messages: {
        textMessage: {
            from:    "sample@localhost",
            to:      "other@localhost",
            subject: "sample text message...",
            text:    "This is a sample message body."
        },
        templateMessage: {
            from:    "sample@localhost",
            to:      "other@localhost",
            subject: "sample template message..."
        }
    },
    templateMessageContext: {
        variable: "convincingly and customizably"
    },
    rawModules: [
        {
            name: "Testing outgoing mail handling...",
            tests: [
                {
                    name: "Test sending a simple message...",
                    type: "test",
                    sequence: [
                        {
                            func: "{textMailer}.sendMessage",
                            args: ["{caseHolder}.options.messages.textMessage"]
                        },
                        {
                            listener: "gpii.mailer.tests.checkResponse",
                            event: "{testEnvironment}.events.onMessageReceived",
                            args:  ["{arguments}.0", "{caseHolder}.options.expected.textMessage"]
                        },
                        // Required to allow the mailer to finish its business before it's destroyed.
                        {
                            listener: "fluid.identity",
                            event: "{textMailer}.events.onSuccess"
                        }
                    ]
                },
                {
                    name: "Test sending a template message...",
                    type: "test",
                    sequence: [
                        {
                            func: "{templateMailer}.sendMessage",
                            args: ["{caseHolder}.options.messages.templateMessage", "{caseHolder}.options.templateMessageContext"]
                        },
                        {
                            listener: "gpii.mailer.tests.checkResponse",
                            event: "{testEnvironment}.events.onMessageReceived",
                            args:  ["{arguments}.0", "{caseHolder}.options.expected.templateMessage"]
                        },
                        // Required to allow the mailer to finish its business before it's destroyed.
                        {
                            listener: "fluid.identity",
                            event: "{templateMailer}.events.onSuccess"
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        textMailer: {
            type: "gpii.express.user.mailer.text",
            options: {
                transportOptions: {
                    port: "{testEnvironment}.options.mailPort"
                }
            }
        },
        templateMailer: {
            type: "gpii.express.user.mailer.handlebars",
            options: {
                transportOptions: {
                    port: "{testEnvironment}.options.mailPort"
                },
                templateDirs: ["%gpii-express-user/tests/templates", "%gpii-express-user/src/templates"],
                textTemplateKey: "mail-text",
                htmlTemplateKey: "mail-html"
            }
        }
    }
});

fluid.defaults("gpii.mailer.tests.environment", {
    gradeNames: ["fluid.test.testEnvironment"],
    mailPort:   "9925",
    events: {
        constructFixtures:     null,
        onFixturesConstructed: null,
        onMessageReceived:     null
    },
    components: {
        mailServer: {
            type:          "gpii.test.mail.smtp",
            createOnEvent: "constructFixtures",
            options: {
                port: "{testEnvironment}.options.mailPort",
                components: {
                    mailServer: {
                        options: {
                            listeners: {
                                "onReady.notifyEnvironment": {
                                    func: "{testEnvironment}.events.onFixturesConstructed.fire"
                                },
                                "onMessageReceived.notifyEnvironment": {
                                    func: "{testEnvironment}.events.onMessageReceived.fire",
                                    args: ["{arguments}.0", "{arguments}.1"]
                                }
                            }
                        }
                    }
                }
            }
        },
        caseHolder: {
            type: "gpii.mailer.tests.caseHolder"
        }
    }

});

fluid.test.runTests("gpii.mailer.tests.environment");
