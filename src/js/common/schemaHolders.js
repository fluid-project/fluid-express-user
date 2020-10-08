/*

    This file defines the core concept of a "schema holder", a grades that holds a schema that can be used to validate
    arbitrary user payloads.  It also provides the core "user" schema extended by the specific schemas used by
    the REST API endpoints in this package.

*/
/* globals require */
(function (fluid) {
    "use strict";
    if (!fluid) {
        fluid = require("infusion");
        fluid.require("%fluid-json-schema");
    }

    // The core schema holder, which defines the fields used in every other user-related schema.
    fluid.defaults("fluid.express.user.schemaHolder", {
        gradeNames: ["fluid.schema.schemaHolder"],
        schema: {
            type: "object",
            title: "fluid-express-user core user schema",
            description: "This schema defines the common format for user data transmitted and received by the fluid-express-user library.",
            definitions: {
                email: {
                    type: "string",
                    format: "email",
                    required: true,
                    errors: {
                        "": "fluid.express.user.email"
                    }
                },
                username: {
                    required: true,
                    type: "string",
                    minLength: 1,
                    errors: {
                        "": "fluid.express.user.username"
                    }
                },
                password: {
                    required: true,
                    errors: {
                        "": "fluid.express.user.password.length"
                    },
                    allOf: [
                        {
                            type: "string",
                            minLength: 8
                        },
                        {
                            type: "string",
                            errors: {
                                "": "fluid.express.user.password.uppercase"
                            },
                            pattern: "[A-Z]+"
                        },
                        {
                            type: "string",
                            errors: {
                                "": "fluid.express.user.password.lowercase"
                            },
                            pattern: "[a-z]+"
                        },
                        {
                            type: "string",
                            errors: {
                                "": "fluid.express.user.password.complexity"
                            },
                            pattern: "[^a-zA-Z]"
                        }
                    ]
                }
            }
        }
    });

    // The schema holder for the first part of the password reset, where an email is required.
    fluid.defaults("fluid.express.user.schemaHolder.forgot", {
        gradeNames: ["fluid.express.user.schemaHolder"],
        schema: {
            title: "'Forgot password' schema.",
            description: "This schema defines the format accepted when requesting a password reset.",
            properties: {
                email: "{that}.options.schema.definitions.email"
            }
        }
    });

    // The schema holder for the second part of a password reset, once the reset code has been received via email.
    fluid.defaults("fluid.express.user.schemaHolder.reset", {
        gradeNames: ["fluid.express.user.schemaHolder"],
        schema: {
            title: "fluid-express-user user password reset schema",
            description: "This schema defines the format accepted when resetting a user's password.",
            properties: {
                password: "{that}.options.schema.definitions.password",
                confirm: "{that}.options.schema.definitions.confirm",
                code: {
                    type: "string",
                    required: true,
                    minLength: 1,
                    errors: {
                        "": "fluid.express.user.reset.password.mismatch"
                    }
                }
            }
        }
    });

    // The schema holder for the initial user signup form.
    fluid.defaults("fluid.express.user.schemaHolder.signup", {
        gradeNames: ["fluid.express.user.schemaHolder"],
        schema: {
            title: "fluid-express-user user signup schema",
            description: "This schema defines the format accepted when creating a new user.",
            properties: {
                email: "{that}.options.schema.definitions.email",
                username: "{that}.options.schema.definitions.username",
                password: "{that}.options.schema.definitions.password",
                confirm: "{that}.options.schema.definitions.confirm",
                profile: "{that}.options.schema.definitions.profile"
            }
        }
    });

    // The schema holder requesting that the initial verification code be resent.
    fluid.defaults("fluid.express.user.schemaHolder.resend", {
        gradeNames: ["fluid.express.user.schemaHolder"],
        schema: {
            title: "fluid-express-user user resend verification code schema",
            description: "This schema defines the format accepted when requesting that a verification code be resent.",
            properties: {
                email: "{that}.options.schema.definitions.email"
            }
        }
    });

    // The schema holder for the user login endpoint.
    fluid.defaults("fluid.express.user.schemaHolder.login", {
        gradeNames: ["fluid.express.user.schemaHolder"],
        schema: {
            title: "fluid-express-user login schema",
            description: "This schema defines the format accepted when logging in.",
            properties: {
                username: {
                    anyOf: [
                        "{that}.options.schema.definitions.username",
                        "{that}.options.schema.definitions.email"
                    ],
                    errors: {
                        "": "fluid.express.user.username.or.email.required"
                    },
                    required: true
                },
                password: {
                    type: "string",
                    required: true,
                    minLength: 1,
                    errors: {
                        "": "fluid.express.user.password.required"
                    }
                }
            }
        }
    });
})(fluid);
