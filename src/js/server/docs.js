// Display API docs written in Markdown
/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

var marked = require("marked");
var fs     = require("fs");

fluid.registerNamespace("gpii.express.api.docs.router");

gpii.express.api.docs.router.middleware = function (that, req, res) {
    var markdown = fs.readFileSync(fluid.module.resolvePath(that.options.mdFile), {encoding: "utf8"});
    res.render(that.options.template, { "title": that.options.title, "body": marked(markdown)});
};

fluid.defaults("gpii.express.api.docs.router", {
    gradeNames: ["gpii.express.middleware"],
    path:       "/",
    method:     "get",
    template:   "pages/docs",
    title:      "API Documentation",
    mdFile:     "%gpii-express-user/docs/apidocs.md",
    invokers: {
        middleware: {
            funcName: "gpii.express.api.docs.router.middleware",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    }
});
