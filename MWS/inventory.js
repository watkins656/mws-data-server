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
let SKUsArray=[];
let inventory = inventoryBuild();

function inventoryBuild() {

    return Object.freeze({
        SKUsArray,
        main,
        insertInventory,
        insertItem,
        fulfillmentInventoryRequest,
        inquire,
        salesByDay,
        getAllSellerSKUs
    })
    function insertInventory(inventory) {
        inventory.forEach(item => {
            insertItem(item);
        });
    };
    function main() {

    };
    function insertItem(item) {
        let query = connection.query(
            "INSERT INTO inventory_supply SET ?",
            {
                Condition: item.Condition,
                SupplyDetail: item.SupplyDetail,
                TotalSupplyQuantity: item.TotalSupplyQuantity,
                FNSKU: item.FNSKU,
                InStockSupplyQuantity: item.InStockSupplyQuantity,
                ASIN: item.ASIN,
                SellerSKU: item.SellerSKU
            },
            (err, res) => {
                console.log(err);
                console.log(res.affectedRows + " order inserted!\n");
                // Call updateProduct AFTER the INSERT completes
            }
        )
    };
    function fulfillmentInventoryRequest(nextToken) {
        nextToken?console.log('running with nextToken: ' + nextToken):console.log('Initial Request');
        amazonMws.fulfillmentInventory.search((nextToken) ? {
            'Version': '2010-10-01',
            'Action': 'ListInventorySupplyByNextToken',
            'SellerId': SellerId,
            'MWSAuthToken': MWSAuthToken,
            'MarketplaceId': 'ATVPDKIKX0DER',
            'QueryStartDateTime': new Date(2016, 9, 24),
            'NextToken': NextToken,
        } : {
                'Version': '2010-10-01',
                'Action': 'ListInventorySupply',
                'SellerId': SellerId,
                'MWSAuthToken': MWSAuthToken,
                'MarketplaceId': 'ATVPDKIKX0DER',
                'QueryStartDateTime': new Date(2016, 9, 24)
            }, (error, response) => {
                if (error) {
                    console.log('fulfillmentInventory error Code: ', error.Code);
                    if (error.Code == 'RequestThrottled') {
                        console.log('restarting due to request throttled');
                        setTimeout(
                            function () { fulfillmentInventoryRequest(nextToken) }, 1000);
                    }
                    return;
                }
                console.log('response recieved');
                let inventory = response.InventorySupplyList.member; // TODO: This is an array of my Amazon FBA Inventory supply.  Insert this into mySQL database 
                insertInventory(inventory);
                if (response.NextToken) { console.log('Next Token: ' + response.NextToken); }
                if (response.NextToken) {
                    NextToken = (response.NextToken);
                    setTimeout(
                        function () { fulfillmentInventoryRequest(NextToken) }, 180000);
                }
                setTimeout(removeDuplicates, 360000);


                return;
            });
    };
    function removeDuplicates() {

        let query = connection.query(`
        DELETE t1 FROM inventory_supply
        t1
                INNER JOIN
                inventory_supply
                t2 
        WHERE
            t2.id > t1.id AND t1.sellerSKU = t2.sellerSKU;
            
        `, (err, results) => {
                console.log('finished removing duplicates'); return;
            });
    };
    function inquire() {
        setTimeout(
            inquireA, 5000
        )
        function inquireA() {
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
        }
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
}


SKUsArray = [];
let query = connection.query(
    `SELECT SellerSKU FROM inventory_supply GROUP BY SellerSKU`,
    (err, res) => {
        res.forEach(SellerSKU => {
            SKUsArray.push(SellerSKU.SellerSKU);
        });
        inventory.SKUsArray = SKUsArray;
        inventory.inquire()

    }
)
// inventory.main()
// inventory.fulfillmentInventoryRequest();
inventory.inquire();

module.exports = inventory;