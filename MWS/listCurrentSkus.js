let dotenv = require("dotenv").config({ path: __dirname + '/../.env' });
var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let SellerId = process.env.MWS_SELLER_ID;
let mySQLPassword = process.env.MYSQL_PASSWORD;
let MWSAuthToken = process.env.MWS_AUTH_TOKEN;
let inquirer = require("inquirer");
let mysql = require("mysql");
let moment = require('moment');
let _ = require('underscore')
let connection = require('../config/connection');
let SKUsArray = [];



function inquire() {
    console.log(SKUsArray);
    inquirer
        .prompt([
            // Here we create a basic text prompt.
            {
                type: "list",
                message: "Which SKU would you like?",
                choices: SKUsArray,
                name: "SKU"
            },
            {
                type: "list",
                message: "How would you like the results?",
                choices: ["BY DAY", "BY WEEK", "BY MONTH"],
                name: "org"
            },
        ])
        .then((res) => {
            switch (res.org) {
                case "BY DAY":
                    salesByDay(res.SKU)
                    break;
                case "BY WEEK":
                    console.log("By Week"); //TODO:
                    break;
                case "BY MONTH":
                    console.log("By Month");    //TODO:
                    break;

                default:
                    break;
            }
        });
};
function salesByDay(msku) {
    var query = connection.query(`SELECT
        o.AmazonOrderId,
    o.PurchaseDate,
    i.SellerSKU,
    i.QuantityOrdered
    FROM
    orders o
    LEFT JOIN order_items i ON o.AmazonOrderId = i.AmazonOrderId
    WHERE ?`, { SellerSKU: msku }, (err, results) => {
            let dateArr = [];
            results.forEach(element => {
                let orderQty = element.QuantityOrdered;
                for (i = 0; i < orderQty; i++) {
                    dateArr.push(moment(element.PurchaseDate).format("MM-DD-YYYY"));
                }
            });
            var counts = _.countBy(dateArr);
            console.log(counts);
            return (counts);
        })
};
function getAllSellerSKUs() {

};


let query = connection.query(
    `SELECT SellerSKU FROM order_items WHERE createdAt > '2019-02-17 05:19:29' GROUP BY SellerSKU`,
    (err, res) => {
        res.forEach(SellerSKU => {
            SKUsArray.push(SellerSKU.SellerSKU);
        });
        console.log(SKUsArray);
        inquire()

    }
)
// inventory.main()
// inventory.fulfillmentInventoryRequest();
// inventory.inquire();

