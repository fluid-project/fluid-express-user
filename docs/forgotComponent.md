# `fluid.express.user.api.forgot`

This component provides a REST endpoint that can be used to request a password reset code.  The reset code is sent to
the user in an email message, which they can use to continue the process using [`/user/reset`](resetComponent.md).

This component is an instance of
[`fluid.express.router.passthrough`](https://github.com/fluid-project/fluid-express/blob/main/docs/router.md) which
wraps two routers.  One is an instance of `fluid.express.singleTemplateRouter` that renders a "forgot password" form
using the templates defined in this package when this endpoint receives a `GET` request.  The other
(`fluid.express.user.api.forgot.post`, see below) handles `POST` requests, such as AJAX requests sent using the above
form.

For details about making REST calls against the API endpoint provided by this component, see the [API docs](apidocs.md).

## Component options

In addition to the options for any instance of
[`fluid.express.router`](https://github.com/fluid-project/fluid-express/blob/main/docs/router.md), this component
supports the following unique options:

| Option                | Type       | Description |
| --------------------- | ---------- | ----------- |
| `codeIssuedKey`       | `{String}` | The field key to use to indicate whether a user has had a reset code issued already.  Should match what is used in [`fluid.express.user.api.reset`](resetComponent.md). |
| `couch`               | `{Object}` | The CouchDB options used to read and write data from Couch.  Generally distributed to this grade by the `fluid.express.user.api` component. |
| `defaultContext`      | `{Object}` | The context (data) available to the renderer used to deliver the "forgot password" form. |
| `resetCodeLength`     | `{Number}` | The length of the reset code we will generate and send to the user via email. |
| `resetCodeKey`        | `{String}` | The field key to use when storing the generated code in the user's CouchDB record. Should match what is used in [`fluid.express.user.api.reset`](resetComponent.md). |
| `templates.form`      | `{String}` | The location of the template to be used for the "forgot password" for, relative to the `templateDirs` option of our `fluid.handlebars` instance. |
| `templates.mail.html` | `{String}` | The location of the email template to be used for the HTML version of the "forgot password" email. This is defined relative to the `templateDirs` option of our `fluid.handlebars` instance. |
| `templates.mail.text` | `{String}` | The location of the email template to be used for the text version of the "forgot password" email. This is defined relative to the `templateDirs` option of our `fluid.handlebars` instance. |
| `urls.read`           | `{String}` | The URL to use when reading user information from CouchDB.  Derived from `options.couch.userDbUrl` (see above) by default. |
| `urls.write`          | `{String}` | The URL to use when writing user information to CouchDB.  Derived from `options.couch.userDbUrl` (see above) by default. |

## Component Invokers

This component has no unique invokers.  For details on the `route` invoker it inherits from
`fluid.express.router.passthrough`, see the [`fluid.express` router documentation](https://github.com/fluid-project/fluid-express/blob/main/docs/router.md).

## `fluid.express.user.api.forgot.post`

This component is an instance of
[`fluid.express.requestAware.router`]((https://github.com/fluid-project/fluid-express/blob/main/docs/requestAwareRouter.md))
with its own `handler` (see `fluid.express.user.api.forgot.post.handler` below).  It has no unique invokers or component
options.

## `fluid.express.user.api.forgot.post.handler`

The handler that actually fields individual requests.

### Component options

The handler instance used here receives a subset of the options sent to `fluid.express.user.api.post` (see above).  In
addition, it has the following unique options:

| Option                | Type       | Description |
| --------------------- | ---------- | ----------- |
| `rules.read`          | `{Object}` | The [model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) to use in preparing to send the raw CouchDB response to the user via the `response` object. |

### Component Invokers

#### `{that}.handleRequest()`

* Returns: Nothing.

This handler launches our "read" data source, which looks up the record for the user whose email or username matches
the `POST` data we received.  The response is handled by a private function.  If a user record is received from CouchDB,
a reset code and flag are added, and the user record is updated.  The results of that write operation are handled by
`handleRequestResponse` (see below).

#### `{that}.handleRequestResponse(error, response, body)`

* `error` - The error reported (if any) when contacting CouchDB.
* `response` - The raw response received from CouchDB.
* `body` - The response payload (JSON) received from CouchDB.
* Returns: Nothing.

If this invoker receives an `error` in writing the user record, it passes that on to the end user via the `response`
object.

Otherwise, the CouchDB response with the updated user record is
[transformed](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) using
`fluid.model.transformWithRules` and `options.rules.read` (see above), and the transformed results are then sent to the
end user using the `response` object.
