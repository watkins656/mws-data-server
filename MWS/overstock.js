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
    console.log("overstock: " + SKUsArray);
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
                    console.log("overstock: " + "By Week"); //TODO:
                    break;
                case "BY MONTH":
                    console.log("overstock: " + "By Month");    //TODO:
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
            console.log("overstock: " + counts);
            return (counts);
        })
};
function getAllSellerSKUs() {

};


let query = connection.query(
    `SELECT 
    Name, 
    Count(Name) as Count, 
    SUM(Quantity) as TotalQuantity,
    MIN(ExpirationDate) as Expiration,  
    datediff(MIN(ExpirationDate),(curdate()+interval 105 day)) as DaysTilAmazonExpiration,
    SUM(Quantity)/datediff(MIN(ExpirationDate),(curdate()+interval 105 day)) as SalesNeededPerDay
    FROM g19kgxd0tyqbpecb.overstock_inventory GROUP BY Name ORDER BY SalesNeededPerDay Desc`,
    (err, res) => {
        console.log("Overstock");
        console.log( res);
    }
)
let query2 = connection.query(
    `SELECT Name, Quantity, ExpirationDate, Location FROM overstock_inventory WHERE ExpirationDate < 2020-07-05`,
    (err, res) => {
        console.log("overstock: " + res);
    }
)
// inventory.main()
// inventory.fulfillmentInventoryRequest();
// inventory.inquire();

