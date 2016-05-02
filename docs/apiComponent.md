# `gpii.express.user.api`

This is a `gpii.express.router` grade that mounts all parts of the user API under it.  In terms of the default path
(`/user`), these endpoints include:


* [`/user/current`](currentComponent.md)
* [`/user/forgot`](forgotComponent.md)
* [`/user/login`](loginComponent.md)
* [`/user/logout`](logoutComponent.md)
* [`/user/reset`](resetComponent.md)
* [`/user/signup`](signupComponent.md)
* [`/user/verify`](verifyComponent.md)

For details about making REST calls against the API endpoints provided by this component, see the [API docs](apidocs.md),
which are returned by default when `/user` is requested with no additional path information.

## Middleware required by this grade

This API requires access to `req.session`, which is provided by the `gpii.express.middleware.session` middleware.
That middleware requires `req.cookies`, which is provided by the `gpii.express.middleware.cookieparser` middleware.
Various endpoints accept `POST`/`PUT` data (`req.body`), so you must also have both the
`gpii.express.middleware.bodyparser.json` and `gpii.express.middleware.bodyparser.urlencoded` middleware.  For details
on each of these pieces of middleware, see [the middleware documentation in `gpii.express`](https://github.com/GPII/gpii-express/blob/master/docs/middleware.md).

The required middleware should be loaded at the same level (or higher) in the path, and before the API itself.  The
order in which middleware loads is controlled using [namespaces and priorities](http://docs.fluidproject.org/infusion/development/Priorities.html).

If you want this to be taken care of automatically, mix the `gpii.express.user.api.withRequiredMiddleware` grade
into your `gpii.express` instance, as in the following example:

```
gpii.express({
    gradeNames: ["gpii.express.user.api.withRequiredMiddleware"],
    port: "8080",
    components: {
        api: {
            type: "gpii.express.user.api",
            options: {
                priority: "after:session"
            }
        }
    }
});
```

This would result in the API being available on `http://localhost:8080/user`.  The same mix-in grade can be used with
a `gpii.express.router` instance, as in the following example:

```
gpii.express({
    gradeNames: ["gpii.express.user.api.withRequiredMiddleware"],
    port: "8080",
    components: {
        v1: {
            type: "gpii.express.router.passthrough",
            options: {
                path: "/v1.0.0",
                gradeNames: ["gpii.express.user.api.withRequiredMiddleware"]
                components: {
                    api: {
                        type: "gpii.express.user.api",
                        options: {
                            priority: "after:session"
                        }
                    }
                }
            }
        }
    }
});
```

This would result in the API being available on `http://localhost:8080/v1.0.0/user`.  In this example, an instance of
each required piece of middleware is loaded for requests under the `v1.0.0` path, and would not be visible to routers
outside of that path.

## Component options

In addition to the options for any instance of [`gpii.express.router`](https://github.com/GPII/gpii-express/blob/master/docs/router.md),
this component supports the following unique options:

| Option             | Type       | Description |
| ------------------ | ---------- | ----------- |
| `app`              | `{Object}` | Information about this application that is exposed to and which can be used in mail templates (see below).|
| `app.name`         | `{String}` | A user facing name for this application, such as "The Unified Listing". |
| `app.url`          | `{String}` | The public facing URL for this application. |
| `couch.port`       | `{String}` | The port on which our CouchDB instance runs. |
| `couch.userDbName` | `{String}` | The CouchDB database name containing our user records.  Defaults to `users`. |
| `couch.userDbUrl`  | `{String}` | The URL of our CouchDB instance.  By default this is expanded from `userDbName` above using the pattern `http://admin:admin@localhost:%port/%userDbName` (see above). |
| `schemaDirs`       | `{Array}`  | An array of schema directories that contain our [JSON Schemas](http://json-schema.org/). Supports package-relative paths like '%gpii-express-user/src/templates'. |
| `templateDirs`     | `{Array}`  | An array of template directories that contain our Handlebars templates.  Supports package-relative paths like "%gpii-express-user/src/templates". |

When resolving schemas and templates from `schemaDirs` and `templateDirs`, the first directory containing matching
content is used.


## Component Invokers

This component has no unique invokers.  For details on the `route` invoker it inherits from `gpii.express.router.passthrough`,
see the [`gpii.express` router documentation](In https://github.com/GPII/gpii-express/blob/master/docs/router.md).