# fluid-express-user

This package provides a series of server and client-side Fluid components to provide simple user management, including:

1. Login, logout, and "current user" mechanisms.
2. A "signup" mechanism to allow users to create accounts themselves.  Accounts must be associated with a valid email to
   be complete the setup.
3. A "forgot password" mechanism that sends the user a custom link via email that can be used to reset their password.

## Server Side Components

The server side components are intended to be used with a `fluid.express` instance, and provide the REST API endpoints
documented in `src/docs/api.md`. Before you can use the server side components, you must set up your database with the
views included in `src/views` (see that directory for details).

When writing your own server-side components that depend on the current user's information, the current user will
always be available as part of the `request.session` object.  The user key may change depending on your configuration,
by default the user is found at `request.session._fluid_user`.

## Client Side Components

The client-side components provided here are intended to be used with the server-side API running on the same hostname
and port that hosts the client-side content.  No CORS, proxy, or other mechanism is provided to handle remote lookups.

To use the client side components, set up your `fluid.express` instance with a static handler that will serve up the
contents of `src/js/client`, and a `fluid.express.hb` instance that can serve up the required template content.  It is
recommended that you copy the sample template content found in `src/templates` to your template directory and customize
based on your specific needs.

For an example of both the server-side configuration and of serving up client-side content, check out the configuration
of `tests/js/launch-test-harness.js` and `tests/js/test-harness.js`,

## Tests

To run the tests in this package, use the command `npm test`.

The tests in this package make use of [fluid-couchdb-test-harness](https://github.com/fluid-project/fluid-couchdb-test-harness).
By default that package uses Docker to run the tests.  To use Vagrant instead, set the environment variable
`FLUID_TEST_COUCH_USE_EXTERNAL` to `true`.  To use a standalone instance of CouchDB (which must run on port `25984`),
set the environment variable `FLUID_TEST_COUCH_USE_EXTERNAL` to `true`.  For the full list of supported environments,
software requirements, and configuration options, see [the documentation for fluid-couchdb-test-harness](https://github.com/fluid-project/fluid-couchdb-test-harness).

The browser tests in this package make use of [fluid-webdriver](https://github.com/fluid-project/fluid-webdriver),
which requires you to install the appropriate version of `chromedriver` (Chrome), `geckodriver` (Firefox), et cetera.
Chrome in particular has issues when its version does not exactly match the version of `chromedriver` installed.  For
more information about the requirements for running the browser tests, see the [fluid-webdriver documentation](https://github.com/fluid-project/fluid-webdriver).

## Migrating from Version 1 to Version 2

Version 1 of this package was designed to tightly mimic the user record structure and password encoding of early
versions of CouchDB.  Version 2 no longer supports this use case.  To migrate from version 1 to version 2, you will
need to make a few key changes to your record structure:

1. You will need to remove the `org.couchdb.user:` prefix from all IDs.
2. You will need to add the previous default value for `digest` ("`sha1`") to each record.
3. You can safely remove the `name` field from all records.
4. All other fields should remain the same.

To give a concrete example, here is a record from version 1:

```json
{
    "_id":         "org.couchdb.user:sample",
    "type":        "user",
    "name":        "sample",
    "username":    "sample",
    "derived_key": "dd11a6d074786fc914cbcdbc7ec5a06ad002812a",
    "salt":        "secret",
    "iterations":  10,
    "email":       "sample@localhost",
    "roles":       ["role1", "role3"],
    "verified":    true
}
```

Here is the same record updated for compatibility with version 2 of this package:

```json
{
    "_id":         "sample",
    "type":        "user",
    "username":    "sample",
    "derived_key": "dd11a6d074786fc914cbcdbc7ec5a06ad002812a",
    "salt":        "secret",
    "digest":      "sha1",
    "iterations":  10,
    "email":       "sample@localhost",
    "roles":       ["role1", "role3"],
    "verified":    true
}
```

One way to migrate all records would be to make use of the
[CouchDB bulk API endpoints](https://docs.couchdb.org/en/stable/api/database/bulk-api.html):

1. Take a backup of your existing user database.
2. Download all existing records including design document(s).
3. Convert the download format into the format used by the [CouchDB `_bulk_docs` endpoint](https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-bulk-docs).
4. Update all records as outlined above (`digest`, `_id`, `name` fields).
5. Remove your existing records.
6. Submit the updated records using the `bulk_docs` endpoint.
