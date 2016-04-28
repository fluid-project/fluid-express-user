# `gpii.express.user.api.forgot`

This component provides a REST endpoint that can be used to request a password reset code.  The reset code is sent to
the user in an email message, which they can use to continue the process using [`/user/reset`](resetComponent.md).

This component is an instance of [`gpii.express.router.passthrough`](https://github.com/GPII/gpii-express/blob/master/docs/router.md)
which wraps two routers.  One is an instance of `gpii.express.singleTemplateRouter` that renders a "forgot password"
form using the templates defined in this package when this endpoint receives a `GET` request.  The other
(`gpii.express.user.api.forgot.post`, see below) handles `POST` requests, such as AJAX requests sent using the
above form.

For details about making REST calls against the API endpoint provided by this component, see the [API docs](apidocs.md).

## Component options

In addition to the options for any instance of [`gpii.express.router`](https://github.com/GPII/gpii-express/blob/master/docs/router.md),
this component supports the following unique options:


| Option                | Type       | Description |
| --------------------- | ---------- | ----------- |
| `codeIssuedKey`       | `{String}` | The field key to use to indicate whether a user has had a reset code issued already.  Should match what is used in [`gpii.express.user.api.reset`](resetComponent.md). |
| `couch`               | `{Object}` | The CouchDB options used to read and write data from Couch.  Generally distributed to this grade by the `gpii.express.user.api` component. |
| `defaultContext`      | `{Object}` | The context (data) available to the renderer used to deliver the "forgot password" form. |
| `resetCodeLength`     | `{Number}` | The length of the reset code we will generate and send to the user via email. |
| `resetCodeKey`        | `{String}` | The field key to use when storing the generated code in the user's CouchDB record. Should match what is used in [`gpii.express.user.api.reset`](resetComponent.md). |
| `templates.form`      | `{String}` | The location of the template to be used for the "forgot password" for, relative to the `templateDirs` option of our `gpii.handlebars` instance. |
| `templates.mail.html` | `{String}` | The location of the email template to be used for the HTML version of the "forgot password" email. This is defined relative to the `templateDirs` option of our `gpii.handlebars` instance. |
| `templates.mail.text` | `{String}` | The location of the email template to be used for the text version of the "forgot password" email. This is defined relative to the `templateDirs` option of our `gpii.handlebars` instance. |
| `urls.read`           | `{String}` | The URL to use when reading user information from CouchDB.  Derived from `options.couch.userDbUrl` (see above) by default. |
| `urls.write`          | `{String}` | The URL to use when writing user information to CouchDB.  Derived from `options.couch.userDbUrl` (see above) by default. |

## Component Invokers

This component has no unique invokers.  For details on the `route` invoker it inherits from `gpii.express.router.passthrough`,
see the [`gpii.express` router documentation](In https://github.com/GPII/gpii-express/blob/master/docs/router.md).

# `gpii.express.user.api.forgot.post`

This component is an instance of [`gpii.express.requestAware.router`]((https://github.com/GPII/gpii-express/blob/master/docs/requestAwareRouter.md))
with its own `handler` (see `gpii.express.user.api.forgot.post.handler` below).  It has no unique invokers or
component options.


# `gpii.express.user.api.forgot.post.handler`

gpii.express.user.api.forgot.post.handler.checkUser = function (that, user) {
    if (!user || !user.username) {
        that.sendResponse(404, { ok: false, message: "No matching user found."});
    }
    else {
        // TODO:  Replace this with a writable dataSource
        that.user = fluid.copy(user);
        that.user[that.options.resetCodeKey]  = gpii.express.user.password.generateSalt(that.options.resetCodeLength);
        that.user[that.options.codeIssuedKey] = new Date();

        var writeUrl = fluid.stringTemplate(that.options.urls.write, { id: that.user._id});
        var writeOptions = {
            url:    writeUrl,
            json:   true,
            method: "PUT",
            body:   that.user
        };
        request(writeOptions, that.handleRequestResponse);
    }
};

gpii.express.user.api.forgot.post.handler.handleRequestResponse = function (that, error, response, body) {
    if (error) {
        that.sendResponse(500, { ok: false, message: error.message, stack: error.stack });
    }
    else if (response && [200, 201].indexOf(response.statusCode) === -1) {
        that.sendResponse(response.statusCode, { ok: false, message: body });
    }
    else {
        that.sendMessage();
    }
};

fluid.defaults("gpii.express.user.api.forgot.post.handler", {
    gradeNames: ["gpii.express.user.api.withMailHandler"],
    messages: {
        success: "A password reset code and instructions have been sent to your email address.",
        error:   "A password reset code could not be sent.  Contact an administrator."
    },
    templates: {
        mail: {
            text:  "email-forgot-text",
            html:  "email-forgot-html"
        }
    },
    rules: {
        mailOptions: {
            to:      "request.body.email",
            subject: { literalValue: "Reset your password..."}
        }
    },
    members: {
        user: null
    },
    invokers: {
        handleRequest: {
            func: "{reader}.get",
            args: ["{that}.request.body"]
        },
        handleRequestResponse: {
            funcName: "gpii.express.user.api.forgot.post.handler.handleRequestResponse",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // error, response, body
        }

    },



## Component options

The handler instance used here receives a subset of the options sent to `gpii.express.user.api.post` (see above).  In
addition, it has the following unique options:

| Option                | Type       | Description |
| --------------------- | ---------- | ----------- |
| `rules.read`          | `{Object}` | The [model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) to use in preparing to send the raw CouchDB response to the user via the `response` object. |


## Component Invokers

### `{that}.handleRequest()`
* Returns: Nothing.

This handler launches our "read" data source, which looks up the record for the user whose email or username matches
the `POST` data we received.  The response is handled by a private function.  If a user record is received from CouchDB,
a reset code and flag are added, and the user record is updated.  The results of that write operation are handled by
`handleRequestResponse` (see below).

### `{that}.handleRequestResponse(error, response, body)`
# `error` - The error reported (if any) when contacting CouchDB.
# `response` - The raw response received from CouchDB.
# `body` - The response payload (JSON) received from CouchDB.
* Returns: Nothing.

If this invoker receives an `error` in writing the user record, it passes that on to the end user via the `response` object.

Otherwise, the CouchDB response with the updated user record is [transformed](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html)
using `fluid.model.transformWithRules` and `options.rules.read` (see above), and the transformed results are then sent
to the end user using the `response` object.