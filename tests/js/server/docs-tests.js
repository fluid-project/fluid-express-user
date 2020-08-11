/*

  Test the API documentation.

 */
/* eslint-env node */
"use strict";
var fluid        = require("infusion");

require("../../../");
require("../lib/");

require("fluid-express");
fluid.express.loadTestingSupport();

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("fluid.tests.express.user.docs.caseHolder", {
    gradeNames: ["fluid.test.webdriver.caseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        docsRequest: {
            type: "fluid.test.express.user.request",
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
                            listener: "fluid.test.express.helpers.isSaneResponse",
                            event:    "{docsRequest}.events.onComplete",
                            args:     ["{docsRequest}.nativeResponse", "{arguments}.0", 200] // response, body, status
                        }
                    ]
                }
            ]
        }
    ]
});

fluid.defaults("fluid.tests.express.user.docs.environment", {
    gradeNames: ["fluid.test.express.user.environment"],
    port:    8778,
    mailPort:   8725,
    components: {
        caseHolder: {
            type: "fluid.tests.express.user.docs.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.express.user.docs.environment");
