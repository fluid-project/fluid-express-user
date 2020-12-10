/*

  Tests for the CouchDB data source used in this package.

 */
/* eslint-env node */
"use strict";
var fluid  = require("infusion");
fluid.logObjectRenderChars = 4096;

var jqUnit = require("node-jqunit");

require("../lib/");

require("../../../src/js/server/lib/datasource");

fluid.registerNamespace("fluid.express.user.datasource.tests");
fluid.express.user.datasource.tests.checkResult = function (that, response, expected) {
    jqUnit.assertLeftHand("The response should equal or be a superset of the expected response...", expected, response);
};

fluid.express.user.datasource.tests.handleError = function (that, error) {
    jqUnit.fail("There was an unhandled error:", JSON.stringify(error, null, 2));
};

fluid.defaults("fluid.express.user.datasource.tests.read", {
    gradeNames: ["fluid.express.user.couchdb.read"],
    listeners: {
        "onError.fail": {
            funcName: "fluid.express.user.datasource.tests.handleError",
            args:     ["{that}", "{arguments}.0"],
            priority: "first"
        }
    }
});

fluid.defaults("fluid.express.user.datasource.tests.read.byId", {
    gradeNames: ["fluid.express.user.datasource.tests.read"],
    url:         "http://localhost:25984/users/%_id",
    termMap:    { _id: "%_id"}
});

fluid.defaults("fluid.express.user.datasource.tests.writable", {
    gradeNames: ["fluid.express.user.couchdb.writable"],
    termMaps: {
        read: { _id: "%_id"},
        write: { _id: "%_id"}
    },
    events: {
        onResult: null
    },
    listeners: {
        "onError.fail": {
            funcName: "fluid.express.user.datasource.tests.handleError",
            args:     ["{that}", "{arguments}.0"],
            priority: "first"
        }
    }
});

fluid.defaults("fluid.express.users.datasource.tests.caseHolder", {
    gradeNames: ["fluid.test.webdriver.caseHolder"],
    expected: {
        sample: {
            "username": "sample",
            "email":    "sample@localhost",
            "verified": true
        },
        createResponse: {
            _id: "created"
        },
        created: {
            "_id":      "created",
            "username": "created",
            "email":    "created@localhost"
        },
        updateResponse: {
            _id: "existing"
        },
        updated: {
            "_id":      "existing",
            "username": "existing",
            "email":    "existing@localhost",
            "verified": true
        }
    },
    rawModules: [
        {
            name: "Testing our custom dataSource grade...",
            tests: [
                {
                    name: "Retrieve a record by a its id...",
                    type: "test",
                    sequence: [
                        {
                            func: "{idReader}.get",
                            args: [{ _id: "sample"}]
                        },
                        {
                            listener: "fluid.express.user.datasource.tests.checkResult",
                            event:    "{idReader}.events.onRead",
                            priority: "last",
                            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.sample"]
                        }
                    ]
                },
                {
                    name: "Retrieve a record from alldocs...",
                    type: "test",
                    sequence: [
                        {
                            func: "{allDocsReader}.get",
                            args: [{ key: "sample"}]
                        },
                        {
                            listener: "fluid.express.user.datasource.tests.checkResult",
                            event:    "{allDocsReader}.events.onRead",
                            priority: "last",
                            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.sample"]
                        }
                    ]
                }
                //,
                // TODO:  Review with Antranig.  This appears to be blocked by the 404 error in the initial read lookup.
                //{
                //    name: "Create a new record...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{createWriter}.set",
                //            args:  [ null, "{that}.options.expected.created"]
                //        },
                //        {
                //            listener: "fluid.express.user.datasource.tests.checkResult",
                //            event:    "{createWriter}.events.onWrite",
                //            priority: "last",
                //            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.createResponse"]
                //        },
                //        {
                //            func: "{verifyCreateReader}.get",
                //            args: [{ _id: "created"}]
                //        },
                //        {
                //            listener: "fluid.express.user.datasource.tests.checkResult",
                //            event:    "{verifyCreateReader}.events.onRead",
                //            priority: "last",
                //            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.created"]
                //        }
                //    ]
                //},
                //{
                //    name: "Update an existing record...",
                //    type: "test",
                //    sequence: [
                //        {
                //            func: "{updateWriter}.set",
                //            args:  [ null, "{that}.options.expected.updated", { _id: "existing"}]
                //        },
                //        {
                //            listener: "fluid.express.user.datasource.tests.checkResult",
                //            event:    "{updateWriter}.events.onWrite",
                //            priority: "last",
                //            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.updateResponse"]
                //        },
                //        {
                //            func: "{verifyUpdateReader}.get",
                //            args: [{ _id: "existing"}]
                //        },
                //        {
                //            listener: "fluid.express.user.datasource.tests.checkResult",
                //            event:    "{verifyUpdateReader}.events.onRead",
                //            priority: "last",
                //            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.updated"]
                //        }
                //    ]
                //}
            ]
        }
    ],
    components: {
        idReader: {
            type: "fluid.express.user.datasource.tests.read.byId"
        },
        allDocsReader: {
            type: "fluid.express.user.datasource.tests.read",
            options: {
                rules: {
                    read: {
                        "": "rows.0.doc"
                    }
                },
                url:      "http://localhost:25984/users/_all_docs?include_docs=true&key=\"%key\"",
                termMap: { key: "%key"}
            }
        },
        createWriter: {
            type: "fluid.express.user.datasource.tests.writable",
            options: {
                urls: {
                    read:  "http://localhost:25984/users/%_id",
                    write: "http://localhost:25984/users/%_id"
                }
            }
        },
        verifyCreateReader: {
            type: "fluid.express.user.datasource.tests.read.byId"
        },
        updateWriter: {
            type: "fluid.express.user.datasource.tests.writable",
            options: {
                urls: {
                    read:  "http://localhost:25984/users/%_id",
                    write: "http://localhost:25984/users/%_id"
                }
            }
        },
        verifyUpdateReader: {
            type: "fluid.express.user.datasource.tests.read.byId"
        }
    }
});

fluid.defaults("fluid.express.user.datasource.tests", {
    gradeNames: ["fluid.test.express.user.environment"],
    components: {
        testCaseHolder: {
            type: "fluid.express.users.datasource.tests.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.express.user.datasource.tests");
