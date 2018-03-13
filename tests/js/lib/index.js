/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-webdriver");
gpii.webdriver.loadTestingSupport();

require("gpii-express");
gpii.express.loadTestingSupport();

var kettle = require("kettle");
kettle.loadTestingSupport();

require("./email");
require("./extract-code");
require("./generate-user");
require("./request");
require("./test-environment");
require("./test-harness");
require("./test-harness-pouch");
require("./verify-response");
