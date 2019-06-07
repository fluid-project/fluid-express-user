/* global require */
(function (fluid) {
    "use strict";
    fluid = fluid || require("fluid");
    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.express.user");

    /**
     *
     * Evaluate a single entry and retrieve the associated global variable if possible.
     *
     * @param {String|Object} toEvaluate - A single message bundle represented as a raw object or as a global variable name.
     * @return {Object} - A message bundle object.
     *
     */
    gpii.express.user.globalOrLiteral = function (toEvaluate) {
        if (typeof toEvaluate === "string") {
            var globalValue = fluid.getGlobalValue(toEvaluate);
            return globalValue !== undefined ? globalValue : {};
        }
        // We can't evolve anything but strings.
        else {
            return toEvaluate;
        }
    };
})(fluid);
