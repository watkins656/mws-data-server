let dotenv = require('dotenv').config({ path: __dirname + '/../.env' })

var Sequelize = require("sequelize");

// Creates mySQL connection using Sequelize, the empty string in the third argument spot is our password.
var sequelize = new Sequelize(process.env.JAWSDB_URL);
"a3t7g6zh8ynzwgit", "o97q01adng4et30o", "rxyfvrff8pusf5tg", {
  host: "bbj31ma8tye2kagi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  port: 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
};



  // Export connection for our ORM to use.
  module.exports = sequelize;