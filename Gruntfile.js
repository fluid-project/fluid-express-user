"use strict";

module.exports = function (grunt) {

    // TODO:  Clean up the project structure into cleanly separated pieces with their own standard src and tests.
    // TODO:  Set up separate checks for the couchapp content, with a different .jshintrc
    grunt.initConfig({
        jshint: {
            src: ["./src/**/*.js", "./tests/**/*.js"],
            buildScripts: ["Gruntfile.js"],
            options: {
                jshintrc: true
            }
        },
        jsonlint: {
            src: ["config/**/*.json", "test/**/*.json", "unifier/**/*.json", "email/**/*.json", "front-end/**/*.json", "import/**/*.json", "test/**/*.json"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask("lint", "Apply jshint and jsonlint", ["jshint", "jsonlint"]);
};
