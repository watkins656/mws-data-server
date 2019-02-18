let dotenv = require('dotenv').config({ path: __dirname + '/../.env' })

var Sequelize = require("sequelize");

// Creates mySQL connection using Sequelize, the empty string in the third argument spot is our password.
var sequelize = new Sequelize(process.env.JAWSDB_URL||
"a3t7g6zh8ynzwgit", "o97q01adng4et30o", "rxyfvrff8pusf5tg", {
  host: "bbj31ma8tye2kagi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  port: 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});



let mySQLPassword = process.env.MYSQL_PASSWORD;

// Set up MySQL connection.
var mysql = require("mysql");
let connection;
if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {


  connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: mySQLPassword,
    database: "amazon"
  });
};
  // Make connection.
  connection.connect(function (err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }
    console.log("connected as id " + connection.threadId);
  });

  // Export connection for our ORM to use.
  module.exports =  connection;