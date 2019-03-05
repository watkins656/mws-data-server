'use strict';
// Read and set environment variables
const dotenv = require("dotenv").config();
const mySQLPassword = process.env.MYSQL_PASSWORD;
const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const inquirer = require('inquirer');
const mysql = require("mysql");
const connection = require('../config/connection');


const MWS = function () {
    // //gets new orders
    const orders = require("./ordersForInterval");

    // //gets the items from the orders
    const orderItems = require("./orderItems");

    // //checks pending items and updates them to 'shipped'
    const pendingOrderUpdater = require("./pendingOrderUpdater");

    // //updates current inventory
    const inventory = require("./inventory");

    // //function that outputs sales for a given sku
    const listCurrentSkus = require("./listCurrentSkus");

    // //function that outputs sales by Day/Week/Month for a given sku
    const salesVelocity = require("./salesVelocity");

    // //function that updates various reports
    const reports = require("./reports");

    //returns the necessary Sales Velocity needed to avoid expiration of products 
    const overstock = require("./overstock");
}
const MWSObject = {
    MWS: function MWS() {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "list",
                    message: "Where to?",
                    choices: ["ORDERS", "PRODUCT RESEARCH", "OVERSTOCK"],
                    name: "action"
                },
            ])
            .then(function (res) {
                switch (res.action) {
                    case "ORDERS":
                        require('./orders.js');
                        break;

                    case "PRODUCT RESEARCH":
                        require('./productResearch.js');
                        break;
                    case "OVERSTOCK":
                        require('./overstock.js');
                        break;

                    default:
                        break;
                }
            });

    }
};
function userAuth() {
    inquirer
        .prompt([
            // Here we create a basic text prompt.
            {
                type: "list",
                message: "New or Existing User?",
                choices: ["EXISTING USER", "NEW USER"],
                name: "newUser"
            },
        ])
        .then(function (res) {
            console.log();
            if (res.newUser === "NEW USER") { newUser(); }
            else { logIn(); }

        });

    function newUser() {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "input",
                    message: "Choose A Username",
                    name: "username"
                },
                {
                    type: "password",
                    message: "Choose A Password",
                    name: "password"
                }
            ])
            .then(function (response) {
                const user = new User(response.username, response.password);
                const queryString = "SELECT username FROM users WHERE ?";
                const queryParams = { username: user.username };
                connection.query(queryString, queryParams,
                    (err, res) => {
                        if (res.length == 0) {
                            addUser(user);

                        }
                        else {
                            console.log("\nUsername already exists!\n");
                            newUser();
                        }
                    }
                )
                function addUser(user) {
                    const query = connection.query(
                        "INSERT INTO users SET ?",
                        user,
                        function (err, res) {
                            console.log(res.affectedRows + " new user added!\n");
                            userAuth();
                        }
                    )
                }

            });

    }
    function logIn() {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "input",
                    message: "Enter your username",
                    name: "username"
                },
                {
                    type: "password",
                    message: "Enter your password",
                    name: "password"
                }
            ])
            .then(function (response) {
                const user = new User(response.username, response.password);
                const queryString = "SELECT * FROM users WHERE ?";
                const queryParams = { username: user.username };
                connection.query(queryString, queryParams,
                    (err, res) => {
                        if (user.password === res[0].password) {
                            console.log('Log-in Successful!');
                            MWS.MWS();
                        }
                        else {
                            console.log("\nForget your password?\n");
                        }
                    }
                )

            })
    }
    function User(name, pass) {
        this.username = name;
        this.password = pass;
    }
}
// require('./ordersForInterval.js');

MWS();