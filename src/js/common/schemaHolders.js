/*

    This file defines the core concept of a "schema holder", a grades that holds a schema that can be used to validate
    arbitrary user payloads.  It also provides the core "user" schema extended by the specific schemas used by
    the REST API endpoints in this package.

*/
// TODO: Reconcile this with the upcoming work on the LSR and update in favour of a generalised pattern.
/* globals require */
(function (fluid) {
    "use strict";
    if (!fluid) {
        fluid = require("infusion");
        fluid.require("%gpii-json-schema");
    }

    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.express.user.schemaHolder");

    gpii.express.user.schemaHolder.generateIfNeeded = function (that) {
        return that.generatedSchema ? fluid.toPromise(that.generatedSchema) : that.generateSchema();
    };

    gpii.express.user.schemaHolder.cacheSchema = function (that, schema) {
        that.generatedSchema = schema;
        return schema;
    };

    fluid.defaults("gpii.express.user.schemaHolder", {
        gradeNames: ["fluid.component"],
        events: {
            getSchema: null,
            generateSchema: null
        },
        members: {
            generatedSchema: false
        },
        schema: {
            $schema: "gss-v7-full#",
            additionalProperties: true
        },
        invokers: {
            getSchema: {
                funcName: "gpii.express.user.schemaHolder.generateIfNeeded",
                args: ["{that}"]
            },
            generateSchema: {
                funcName: "fluid.promise.fireTransformEvent",
                args: ["{that}.events.generateSchema"]
            }
        },
        listeners: {
            "generateSchema.getOptions": {
                priority: "first",
                funcName: "fluid.identity",
                args: ["{that}.options.schema"]
            },
            "generateSchema.cacheSchema": {
                priority: "last",
                funcName: "gpii.express.user.schemaHolder.cacheSchema",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    // The core schema which defines the fields used in every other user-related schema.
    fluid.defaults("gpii.express.user.schemaHolder.userCore", {
        gradeNames: ["gpii.express.user.schemaHolder"],
        schema: {
            type: "object",
            title: "gpii-express-user core user schema",
            description: "This schema defines the common format for user data transmitted and received by the gpii-express-user library.",
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
            }
        }
    });

    // The schema holder for the first part of the password reset, where an email is required.
    fluid.defaults("gpii.express.user.schemaHolder.forgot", {
        gradeNames: ["gpii.express.user.schemaHolder.userCore"],
        schema: {
            title: "'Forgot password' schema.",
            description: "This schema defines the format accepted when requesting a password reset.",
            properties: {
                email: "{that}.options.schema.definitions.email"
            }
        }
    });

    // The schema holder for the second part of a password reset, once the reset code has been received via email.
    fluid.defaults("gpii.express.user.schemaHolder.reset", {
        gradeNames: ["gpii.express.user.schemaHolder.userCore"],
        schema: {
            title: "gpii-express-user user password reset schema",
            description: "This schema defines the format accepted when resetting a user's password.",
            properties: {
                password: "{that}.options.schema.definitions.password",
                confirm: "{that}.options.schema.definitions.confirm",
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
        gradeNames: ["gpii.express.user.schemaHolder.userCore"],
        schema: {
            title: "gpii-express-user user signup schema",
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
    fluid.defaults("gpii.express.user.schemaHolder.resend", {
        gradeNames: ["gpii.express.user.schemaHolder.userCore"],
        schema: {
            title: "gpii-express-user user resend verification code schema",
            description: "This schema defines the format accepted when requesting that a verification code be resent.",
            properties: {
                email: "{that}.options.schema.definitions.email"
            }
        }
    });

    // The schema holder for the user login endpoint.
    fluid.defaults("gpii.express.user.schemaHolder.login", {
        gradeNames: ["gpii.express.user.schemaHolder.userCore"],
        schema: {
            title: "gpii-express-user login schema",
            description: "This schema defines the format accepted when logging in.",
            properties: {
                username: {
                    anyOf: [
                        "{that}.options.schema.definitions.username",
                        "{that}.options.schema.definitions.email"
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
