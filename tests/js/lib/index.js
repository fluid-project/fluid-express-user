/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("fluid-webdriver");
fluid.webdriver.loadTestingSupport();

require("fluid-express");
fluid.express.loadTestingSupport();

var kettle = require("kettle");
kettle.loadTestingSupport();

require("./email");
require("./extract-code");
require("./generate-user");
require("./request");
require("./test-environment");
require("./test-harness");
require("./test-harness-couch");
require("./verify-response");
