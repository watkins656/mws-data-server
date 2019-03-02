'use strict';
// Read and set environment variables
let dotenv = require("dotenv").config();
let mySQLPassword = process.env.MYSQL_PASSWORD;
var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let inquirer = require('inquirer');
let mysql = require("mysql");
let connection = require('../config/connection');


let MWS = function(){
    // //gets new orders
let orders = require("./ordersForInterval");

// //gets the items from the orders
let orderItems = require("./orderItems");

// //checks pending items and updates them to 'shipped'
let pendingOrderUpdater = require("./pendingOrderUpdater");

// //updates current inventory
// let inventory = require("./inventory");

// //function that outputs sales for a given sku
// let listCurrentSkus = require("./listCurrentSkus");

// //function that outputs sales by Day/Week/Month for a given sku
// let salesVelocity = require("./salesVelocity");

//returns the necessary Sales Velocity needed to avoid expiration of products 
// let overstock = require("./overstock");
}
let MWSObject = {
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
                choices: [ "EXISTING USER","NEW USER"],
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
                let user = new User(response.username, response.password);
                let query = connection.query("SELECT username FROM users WHERE ?", { username: user.username }, (err, res) => {
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
                    let query = connection.query(
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
                let user = new User(response.username, response.password);
                let query = connection.query("SELECT * FROM users WHERE ?", { username: user.username }, (err, res) => {
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