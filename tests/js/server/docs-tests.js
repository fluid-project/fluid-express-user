/*

  Test the API documentation.

 */

"use strict";

var fluid        = require("infusion");
var gpii         = fluid.registerNamespace("gpii");

require("../../../");
require("../lib/");

require("gpii-express");
gpii.express.loadTestingSupport();

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.tests.express.user.docs.caseHolder", {
    gradeNames: ["gpii.test.express.user.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        docsRequest: {
            type: "gpii.test.express.user.request",
            options: {
                endpoint: "api/user/"
            }
        }
    },
    rawModules: [
        {
            name: "Testing API documentation...",
            tests: [
                {
                    name: "Confirming that there is documentation content...",
                    type: "test",
                    sequence: [
                        {
                            func: "{docsRequest}.send",
                            args: []
                        },
                        {
                            listener: "gpii.test.express.helpers.isSaneResponse",
                            event:    "{docsRequest}.events.onComplete",
                            args:     ["{docsRequest}.nativeResponse", "{arguments}.0", 200] // response, body, status
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("gpii.tests.express.user.docs.environment", {
    gradeNames: ["gpii.test.express.user.environment"],
    apiPort:    8778,
    pouchPort:  8764,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "gpii.tests.express.user.docs.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.express.user.docs.environment");