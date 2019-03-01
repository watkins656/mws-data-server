let dotenv = require('dotenv').config({ path: __dirname + '/../.env' })

var Sequelize = require("sequelize");

// Creates mySQL connection using Sequelize, the empty string in the third argument spot is our password.
var sequelize = new Sequelize(process.env.JAWSDB_URL);
process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.HOST,
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