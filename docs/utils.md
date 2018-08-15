# Utility Components and Methods API

A number of useful routines for user management are available via a promise based API.
These are useful for writing management and batch routines, building other HTTP interfaces
and services on top of the system, and testing.

# `gpii.express.user.utils`

Component containing a number of useful utility methods. Detailed JSDocs for the
component and invokers are located in [utils.js](../src/js/server/utils.js).

## Component Options

This component requires the same CouchDB options as other components in this module.

| Option             | Type       | Description |
| ------------------ | ---------- | ----------- |
| `couch.port`       | `{String}` | The port on which our CouchDB instance runs. |
| `couch.userDbName` | `{String}` | The CouchDB database name containing our user records.  Defaults to `users`. |
| `couch.userDbUrl`  | `{String}` | The URL of our CouchDB instance.  By default this is expanded from `userDbName` above using the pattern `http://admin:admin@localhost:%port/%userDbName` (see above). |

## Component Invokers

## `{that}.createNewUser(userData)`

* Take an object with `username`, `email`, and `password` entries.
* Returns a promise containing either the new CouchDB record for the account or
  an `error` property and message.

Creates a new user in the system with a username, email, and password.

```javascript
utils.createNewUser({username: "alice", email: "alice@gpii.org", password: "#1 Cloudsafe!"});
```

## `{that}.verifyPassword(userRecord, password)`

* Takes a full user record object as stored in CouchDB and checks to see if the
  supplied password matches.
* Returns true or false if the password matches.

```javascript
var userRecord = couchDBStore.getUserRecordFromCouchForUsernameOrEmail("alice");
utils.verifyPassword(userRecord, "#1 CloudSafe!"); // true if this is their password
```

Returns a promise that will contain the user recored on a successful resolve.

## `{that}.unlockUser(username, password)

* Takes a username and password as strings.
* Returns the `userData` record if the password is correct, otherwise an `isError` Object.

```javascript
var userRecord = utils.unlockUser("alice", "#1 Cloudsafe!");
// userRecord is their full internal record from CouchDB
```
