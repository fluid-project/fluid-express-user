"use strict";
var fluid = require("infusion");

require("./src/js/server/lib/datasource");
require("./src/js/server/lib/loginRequired");
require("./src/js/server/lib/mailer");
require("./src/js/server/lib/password");
require("./src/js/server/lib/withMailHandler");
require("./src/js/server/lib/validationGatedRouter");

require("./src/js/server/api.js");

fluid.module.register("gpii-express-user", __dirname, require);