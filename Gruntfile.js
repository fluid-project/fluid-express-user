/* eslint-env node */
"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        lintAll: {
            sources: {
                md: [ "./*.md","./docs/*.md"],
                js: ["./src/**/*.js", "./tests/**/*.js", "./*.js"],
                json: ["./*.json", "tests/**/*.json", "src/**/*.json", "./.nycrc"],
                json5: [],
                other: ["./.*"]
            }
        }
    });

    grunt.loadNpmTasks("gpii-grunt-lint-all");
    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);
};
