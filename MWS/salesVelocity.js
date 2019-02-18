let dotenv = require("dotenv").config();
var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let inquirer = require("inquirer");
let mysql = require("mysql");
let moment = require('moment');
let _ = require('underscore')
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "amazon"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

});
let salesVelocity = {
    SKUsArray: [],
    main: function () {
        var query = connection.query(`SELECT SellerSKU from order_items GROUP BY SellerSKU ORDER BY SellerSKU`, (err, results) => {
            console.log('Here');
            let arr = [];
            results.forEach(element => {
                if (element.SellerSKU)
                    this.SKUsArray.push(element.SellerSKU);
            });
            this.inquirer();
            return;
        })
    },
    inquirer: function () {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "list",
                    message: "Which SKU would you like?",
                    choices: this.SKUsArray,
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
                        this.salesByDay(res.SKU)
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


    },
    salesByDay: function (msku) {
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
    },
    getAllSellerSKUs: function () {

    }
}
salesVelocity.main();

module.exports = salesVelocity;