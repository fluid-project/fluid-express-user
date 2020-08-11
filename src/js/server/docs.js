// Display API docs written in Markdown
/* eslint-env node */
"use strict";
var fluid  = require("infusion");

var MarkDownIt = require("markdown-it");
var fs     = require("fs");

fluid.registerNamespace("fluid.express.api.docs.router");

fluid.express.api.docs.router.middleware = function (that, req, res) {
    var markdownSource = fs.readFileSync(fluid.module.resolvePath(that.options.mdFile), {encoding: "utf8"});
    var mdRenderer = new MarkDownIt();
    res.render(that.options.template, { "title": that.options.title, "body": mdRenderer.render(markdownSource)});
};

fluid.defaults("fluid.express.api.docs.router", {
    gradeNames: ["fluid.express.middleware"],
    path:       "/",
    method:     "get",
    template:   "pages/docs",
    title:      "API Documentation",
    mdFile:     "%fluid-express-user/docs/apidocs.md",
    invokers: {
        middleware: {
            funcName: "fluid.express.api.docs.router.middleware",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    }
});
