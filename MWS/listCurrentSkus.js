const dotenv = require("dotenv").config({ path: __dirname + '/../.env' });
const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const SellerId = process.env.MWS_SELLER_ID;
const mySQLPassword = process.env.MYSQL_PASSWORD;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const inquirer = require("inquirer");
const mysql = require("mysql");
const moment = require('moment');
const _ = require('underscore')
const connection = require('../config/connection');
const SKUsArray = ['1','2'];



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
    const query = connection.query(`SELECT
        o.AmazonOrderId,
    o.PurchaseDate,
    i.SellerSKU,
    i.QuantityOrdered
    FROM
    orders o
    LEFT JOIN order_items i ON o.AmazonOrderId = i.AmazonOrderId
    WHERE ?`, { SellerSKU: msku }, (err, results) => {
            const dateArr = [];
            results.forEach(element => {
                const orderQty = element.QuantityOrdered;
                for (i = 0; i < orderQty; i++) {
                    dateArr.push(moment(element.PurchaseDate).format("MM-DD-YYYY"));
                }
            });
            const counts = _.countBy(dateArr);
            console.log(counts);
            return (counts);
        })
};
function getAllSellerSKUs() {

};


const query = connection.query(
    `SELECT SellerSKU FROM order_items WHERE createdAt > '2019-01-17 05:19:29' GROUP BY SellerSKU`,
    (err, res) => {
        res.forEach(SellerSKU => {
            SKUsArray.push(SellerSKU.SellerSKU);
        });
        console.log(SKUsArray);
        // inquire()
        salesByDay('Slim Jim Bacon Jerky 8-pack')

    }
)
// inventory.main()
// inventory.fulfillmentInventoryRequest();
// inventory.inquire();

