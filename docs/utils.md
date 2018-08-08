# Utility Components and Methods API

A number of useful routines for user management are available via a promise based API. These are useful for writing management and batch routines, building other HTTP interfaces and services on top of the system, and testing.

## gpii.express.user.utils

Component containing a number of useful utility methods. Detailed JSDocs for the 
component and invokers are located in [utils.js](../src/js/server/utils.js).

### createNewUser

Creates a new user in the system with a username, email, and password.

Returns a promise that will contain the new user record after successful creation.

### verifyPassword

Takes a full user record object as stored in CouchDB and checks to see if the supplied password matches.

Returns a promise that will contain the user recored on a successful resolve.

### unlockUser

Takes a username and password and returns True if they match.

