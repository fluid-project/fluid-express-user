# `gpii.express.user.api.current`

This component provides a REST endpoint that displays information about the current user (and indicates whether they are
logged in).  It is an instance of [`gpii.express.requestAware.router`]((https://github.com/GPII/gpii-express/blob/master/docs/requestAwareRouter.md))
with its own `handler` (see `gpii.express.user.api.current.handler` below).

For details about making REST calls against the API endpoint provided by this component, see the [API docs](apidocs.md).

## Component options

This component supports only the common options available to any
[`gpii.express.router`](https://github.com/GPII/gpii-express/blob/master/docs/router.md) or
[`gpii.express.requestAware.router`](https://github.com/GPII/gpii-express/blob/master/docs/requestAwareRouter.md) instance.

## `gpii.express.user.api.current.handler`

This component is an instance of [`gpii.express.handler`]((https://github.com/GPII/gpii-express/blob/master/docs/handler.md)),
meant for use with the above `requestAwareRouter`.

### Component options

In addition to the options for any instance of [`gpii.express.router`](https://github.com/GPII/gpii-express/blob/master/docs/router.md),
this component supports the following unique options:

| Option       | Type       | Description |
| ------------ | ---------- | ----------- |
| `sessionKey` | `{String}` | The session key to use when storing our session information in `req.session`.  Must match what is found in `loginRequired` and other grades used in this package. |

### Component Invokers

#### `{that}.handleRequest()`

* Returns: Nothing.

Fulfills the standard contract for an instance of [`gpii.express.handler`]((https://github.com/GPII/gpii-express/blob/master/docs/handler.md)).
It sends either information about the current user, or a message indicating that the user is not already logged in.
