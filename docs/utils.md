# Utility Components and Methods API

A number of useful routines for user management are available via a promise based API.
These are useful for writing management and batch routines, building other HTTP interfaces
and services on top of the system, and testing.

## `gpii.express.user.utils`

Component containing a number of useful utility methods. Detailed JSDocs for the
component and invokers are located in [utils.js](../src/js/server/utils.js).

### Component Options

This component requires the same CouchDB options as other components in this module.

| Option             | Type       | Description |
| ------------------ | ---------- | ----------- |
| `couch.port`       | `{String}` | The port on which our CouchDB instance runs. |
| `couch.userDbName` | `{String}` | The CouchDB database name containing our user records.  Defaults to `users`. |
| `couch.userDbUrl`  | `{String}` | The URL of our CouchDB instance.  By default this is expanded from `userDbName` above using the pattern `http://admin:admin@localhost:%port/%userDbName` (see above). |

### Component Invokers

### `{that}.createNewUser(userData)`

* `userData` - Take an object with `username`, `email`, and `password` entries.
* Returns:  A promise resolving with the new CouchDB user record on success, or
  a promise rejecting with an `error` property and message on failure.

Creates a new user in the system with a username, email, and password.

```javascript
utils.createNewUser({username: "alice", email: "alice@gpii.org", password: "#1 Cloudsafe!"});
```

### `{that}.verifyPassword(userRecord, password)`

* `userRecord` - Takes a full user record object as stored in CouchDB and checks to see if the
  supplied password matches. In general this should be a record retrieved from CouchDB and not
  something you generate yourself. For reference, the `userRecord` structure can be seen in
  this [test fixture](https://github.com/GPII/gpii-express-user/blob/a83beacdffb4096a379fe91a8f6e23979839fdd8/tests/data/users.json).
* `password` - Password to verify against the userRecord.
* Returns: `true` if the password matches, otherwise `false`.

```javascript
var userRecord = couchDBStore.getUserRecordFromCouchForUsernameOrEmail("alice");
utils.verifyPassword(userRecord, "#1 CloudSafe!"); // true if this is their password
```

Returns a promise that will contain the user recored on a successful resolve.

### `{that}.unlockUser(username, password)`

* `username` - Username string to unlock.
* `password` - Password string to use for unlocking `username`.
* Returns: A `fluid.promise` resolving with the `userData` record if the password is correct,
  otherwise rejecting with an `isError` Object.

```javascript
var userRecord = utils.unlockUser("alice", "#1 Cloudsafe!");
// userRecord is their full internal record from CouchDB
```
