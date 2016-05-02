/*

  Tests for the CouchDB data source used in this package.

 */
"use strict";
var fluid  = require("infusion");
fluid.logObjectRenderChars = 4096;

var gpii   = fluid.registerNamespace("gpii");
var jqUnit = require("node-jqunit");

var express = require("gpii-express");
express.loadTestingSupport();

var kettle = require("kettle");
kettle.loadTestingSupport();

require("../lib/");

require("../../../src/js/server/lib/datasource");

fluid.registerNamespace("gpii.express.user.datasource.tests");
gpii.express.user.datasource.tests.checkResult = function (that, response, expected) {
    jqUnit.assertLeftHand("The response should equal or be a superset of the expected response...", expected, response);
};

gpii.express.user.datasource.tests.handleError = function (that, error) {
    jqUnit.fail("There was an unhandled error:", JSON.stringify(error, null, 2));
};

fluid.defaults("gpii.express.user.datasource.tests.read", {
    gradeNames: ["gpii.express.user.couchdb.read"],
    listeners: {
        "onError.fail": {
            funcName: "gpii.express.user.datasource.tests.handleError",
            args:     ["{that}", "{arguments}.0"],
            priority: "first"
        }
    }
});

fluid.defaults("gpii.express.user.datasource.tests.read.byId", {
    gradeNames: ["gpii.express.user.datasource.tests.read"],
    url:         "http://localhost:3579/users/%_id",
    termMap:    { _id: "%_id"}
});

fluid.defaults("gpii.express.user.datasource.tests.writable", {
    gradeNames: ["gpii.express.user.couchdb.writable"],
    termMaps: {
        read: { _id: "%_id"},
        write: { _id: "%_id"}
    },
    events: {
        onResult: null
    },
    listeners: {
        "onError.fail": {
            funcName: "gpii.express.user.datasource.tests.handleError",
            args:     ["{that}", "{arguments}.0"],
            priority: "first"
        }
    }
});

fluid.defaults("gpii.express.users.datasource.tests.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder"],
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
                            args: [{ _id: "org.couchdb.user:sample"}]
                        },
                        {
                            listener: "gpii.express.user.datasource.tests.checkResult",
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
                            args: [{ key: "org.couchdb.user:sample"}]
                        },
                        {
                            listener: "gpii.express.user.datasource.tests.checkResult",
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
                //            listener: "gpii.express.user.datasource.tests.checkResult",
                //            event:    "{createWriter}.events.onWrite",
                //            priority: "last",
                //            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.createResponse"]
                //        },
                //        {
                //            func: "{verifyCreateReader}.get",
                //            args: [{ _id: "created"}]
                //        },
                //        {
                //            listener: "gpii.express.user.datasource.tests.checkResult",
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
                //            listener: "gpii.express.user.datasource.tests.checkResult",
                //            event:    "{updateWriter}.events.onWrite",
                //            priority: "last",
                //            args:     ["{caseHolder}", "{arguments}.0", "{caseHolder}.options.expected.updateResponse"]
                //        },
                //        {
                //            func: "{verifyUpdateReader}.get",
                //            args: [{ _id: "existing"}]
                //        },
                //        {
                //            listener: "gpii.express.user.datasource.tests.checkResult",
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
            type: "gpii.express.user.datasource.tests.read.byId"
        },
        allDocsReader: {
            type: "gpii.express.user.datasource.tests.read",
            options: {
                rules: {
                    read: {
                        "": "rows.0.doc"
                    }
                },
                url:      "http://localhost:3579/users/_all_docs?include_docs=true&key=\"%key\"",
                termMap: { key: "%key"}
            }
        },
        createWriter: {
            type: "gpii.express.user.datasource.tests.writable",
            options: {
                urls: {
                    read:  "http://localhost:3579/users/%_id",
                    write: "http://localhost:3579/users/%_id"
                }
            }
        },
        verifyCreateReader: {
            type: "gpii.express.user.datasource.tests.read.byId"
        },
        updateWriter: {
            type: "gpii.express.user.datasource.tests.writable",
            options: {
                urls: {
                    read:  "http://localhost:3579/users/%_id",
                    write: "http://localhost:3579/users/%_id"
                }
            }
        },
        verifyUpdateReader: {
            type: "gpii.express.user.datasource.tests.read.byId"
        }
    }
});

fluid.defaults("gpii.express.user.datasource.tests", {
    gradeNames: ["fluid.test.testEnvironment"],
    pouchPort: "3579",
    events: {
        constructServer: null,
        onStarted: null
    },
    components: {
        pouch: {
            type:          "gpii.test.express.user.pouch",
            createOnEvent: "constructServer",
            options: {
                listeners: {
                    "onAllStarted.notifyParent": {
                        func: "{testEnvironment}.events.onStarted.fire"
                    }
                }
            }
        },
        testCaseHolder: {
            type: "gpii.express.users.datasource.tests.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.express.user.datasource.tests");