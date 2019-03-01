let dotenv = require('dotenv').config({ path: __dirname + '/../.env' })

var Sequelize = require("sequelize");

// Creates mySQL connection using Sequelize, the empty string in the third argument spot is our password.
var sequelize = new Sequelize(process.env.JAWSDB_URL||
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.HOST,
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