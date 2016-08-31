// Utility to examine a mail message and extract a code based on a regexp.  Used with both the password reset and
// account creation tests.
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var fs = require("fs");
var MailParser = require("mailparser").MailParser;

fluid.registerNamespace("gpii.test.express.user");

gpii.test.express.user.extractCode = function (testEnvironment, pattern) {
    var content = fs.readFileSync(testEnvironment.smtp.mailServer.currentMessageFile, "utf8");

    var promise = fluid.promise();

    var mailParser = new MailParser({debug: false});

    // If this gets any deeper, refactor to use a separate function
    mailParser.on("end", function (mailObject) {
        var content = mailObject.text;
        if (content) {
            var verificationCodeRegexp = new RegExp(pattern, "i");
            var matches = content.toString().match(verificationCodeRegexp);

            if (matches) {
                promise.resolve(matches[1]);
            }
            else {
                promise.reject();
            }
        }
        else {
            promise.reject();
        }
    });

    mailParser.write(content);
    mailParser.end();

    return promise;
};
