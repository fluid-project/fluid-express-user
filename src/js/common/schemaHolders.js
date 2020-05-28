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
        fluid.require("%gpii-json-schema");
    }

    // The core schema holder, which defines the fields used in every other user-related schema.
    fluid.defaults("gpii.express.user.schemaHolder", {
        gradeNames: ["gpii.schema.schemaHolder"],
        // TODO: Move this back into the schema.
        definitions: {
            email: {
                type: "string",
                format: "email",
                required: true,
                errors: {
                    "": "gpii.express.user.email"
                }
            },
            username: {
                required: true,
                type: "string",
                minLength: 1,
                errors: {
                    "": "gpii.express.user.username"
                }
            },
            password: {
                required: true,
                errors: {
                    "": "gpii.express.user.password.length"
                },
                allOf: [
                    {
                        type: "string",
                        minLength: 8
                    },
                    {
                        type: "string",
                        errors: {
                            "": "gpii.express.user.password.uppercase"
                        },
                        pattern: "[A-Z]+"
                    },
                    {
                        type: "string",
                        errors: {
                            "": "gpii.express.user.password.lowercase"
                        },
                        pattern: "[a-z]+"
                    },
                    {
                        type: "string",
                        errors: {
                            "": "gpii.express.user.password.complexity"
                        },
                        pattern: "[^a-zA-Z]"
                    }
                ]
            }
        },
        schema: {
            type: "object",
            title: "gpii-express-user core user schema",
            description: "This schema defines the common format for user data transmitted and received by the gpii-express-user library."
        }
    });

    // The schema holder for the first part of the password reset, where an email is required.
    fluid.defaults("gpii.express.user.schemaHolder.forgot", {
        gradeNames: ["gpii.express.user.schemaHolder"],
        schema: {
            title: "'Forgot password' schema.",
            description: "This schema defines the format accepted when requesting a password reset.",
            properties: {
                // TODO: Revert
                // email: "{that}.options.schema.definitions.email"
                email: "{that}.options.definitions.email"
            }
        }
    });

    // The schema holder for the second part of a password reset, once the reset code has been received via email.
    fluid.defaults("gpii.express.user.schemaHolder.reset", {
        gradeNames: ["gpii.express.user.schemaHolder"],
        schema: {
            title: "gpii-express-user user password reset schema",
            description: "This schema defines the format accepted when resetting a user's password.",
            properties: {
                // TODO: Revert
                // password: "{that}.options.schema.definitions.password",
                // confirm: "{that}.options.schema.definitions.confirm",
                password: "{that}.options.definitions.password",
                confirm: "{that}.options.definitions.confirm",
                code: {
                    type: "string",
                    required: true,
                    minLength: 1,
                    errors: {
                        "": "gpii.express.user.reset.password.mismatch"
                    }
                }
            }
        }
    });

    // The schema holder for the initial user signup form.
    fluid.defaults("gpii.express.user.schemaHolder.signup", {
        gradeNames: ["gpii.express.user.schemaHolder"],
        schema: {
            title: "gpii-express-user user signup schema",
            description: "This schema defines the format accepted when creating a new user.",
            properties: {
                // TODO: Revert
                // email: "{that}.options.schema.definitions.email",
                // username: "{that}.options.schema.definitions.username",
                // password: "{that}.options.schema.definitions.password",
                // confirm: "{that}.options.schema.definitions.confirm",
                // profile: "{that}.options.schema.definitions.profile"
                email: "{that}.options.definitions.email",
                username: "{that}.options.definitions.username",
                password: "{that}.options.definitions.password",
                confirm: "{that}.options.definitions.confirm",
                profile: "{that}.options.definitions.profile"
            }
        }
    });

    // The schema holder requesting that the initial verification code be resent.
    fluid.defaults("gpii.express.user.schemaHolder.resend", {
        gradeNames: ["gpii.express.user.schemaHolder"],
        schema: {
            title: "gpii-express-user user resend verification code schema",
            description: "This schema defines the format accepted when requesting that a verification code be resent.",
            properties: {
                // TODO: Revert
                // email: "{that}.options.schema.definitions.email"
                email: "{that}.options.definitions.email"
            }
        }
    });

    // The schema holder for the user login endpoint.
    fluid.defaults("gpii.express.user.schemaHolder.login", {
        gradeNames: ["gpii.express.user.schemaHolder"],
        schema: {
            title: "gpii-express-user login schema",
            description: "This schema defines the format accepted when logging in.",
            properties: {
                username: {
                    anyOf: [
                        // TODO: Revert
                        // "{that}.options.schema.definitions.username",
                        // "{that}.options.schema.definitions.email"
                        "{that}.options.definitions.username",
                        "{that}.options.definitions.email"
                    ],
                    errors: {
                        "": "gpii.express.user.username.or.email.required"
                    },
                    required: true
                },
                password: {
                    type: "string",
                    required: true,
                    minLength: 1,
                    errors: {
                        "": "gpii.express.user.password.required"
                    }
                }
            }
        }
    });
})(fluid);
