/* eslint-env node */
"use strict";

module.exports = function (grunt) {
    // TODO:  Set up separate checks for the couchapp content, with a different .jshintrc
    grunt.initConfig({
        eslint: {
            src: ["./src/**/*.js", "./tests/**/*.js", "./*.js"]
        },
        jsonlint: {
            src: ["config/**/*.json", "test/**/*.json", "unifier/**/*.json", "email/**/*.json", "front-end/**/*.json", "import/**/*.json", "test/**/*.json"]
        }
    });

    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("lint", "Apply jshint and jsonlint", ["eslint", "jsonlint"]);
};
