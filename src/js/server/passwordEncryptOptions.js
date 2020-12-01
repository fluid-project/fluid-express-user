/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.defaults("fluid.express.user.passwordEncryptOptionsHolder", {
    gradeNames: ["fluid.component"],
    digest:       "blake2b512",
    iterations:   10,
    keyLength:    20,
    saltLength:   32
});


fluid.defaults("fluid.express.user.passwordEncryptOptionsConsumer", {
    gradeNames: ["fluid.component"],
    digest:     "{fluid.express.user.passwordEncryptOptionsHolder}.options.digest",
    iterations: "{fluid.express.user.passwordEncryptOptionsHolder}.options.iterations",
    keyLength:  "{fluid.express.user.passwordEncryptOptionsHolder}.options.keyLength",
    saltLength: "{fluid.express.user.passwordEncryptOptionsHolder}.options.saltLength"
});
