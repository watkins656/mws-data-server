let dotenv = require("dotenv").config();
var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let MWSAuthToken = process.env.MWS_AUTH_TOKEN;
let SellerId = process.env.MWS_SELLER_ID;
let mySQLPassword = process.env.MYSQL_PASSWORD;
let inquirer = require('inquirer');
let mysql = require("mysql");
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: mySQLPassword,
    database: "amazon"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("\nSuccessfully Connected to the database! Connection ID:" + connection.threadId + "\n");
    productResearch.main();
});


let productResearch = {

    main: function () {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "list",
                    message: "Which Search to Run?",
                    choices: ["LOWEST PRICED OFFERS FOR ASIN", "LOWEST PRICED OFFERS FOR SKU", "MATCHING PRODUCT", "MATCHING PRODUCT FOR SEVERAL ASINS", "LIST MATCHING PRODUCTS"],
                    name: "action"
                },
                {
                    type: "input",
                    message: "Enter a search term - [ASIN | SKU | UPC]?",
                    name: "searchTerm"
                },

            ])
            .then(function (res) {
                switch (res.action) {
                    case "LOWEST PRICED OFFERS FOR ASIN":
                        LOWESTPRICEDOFFERSFORASIN(res.searchTerm);
                        break;

                    case "LOWEST PRICED OFFERS FOR SKU":
                        LOWESTPRICEDOFFERSFORSKU(res.searchTerm);
                        break;

                    case "MATCHING PRODUCT":
                        MATCHINGPRODUCT(res.searchTerm);
                        break;

                    case "MATCHING PRODUCT FOR SEVERAL ASINS":
                        MATCHINGPRODUCTFORSEVERALASINS();
                        break;

                    case "LIST MATCHING PRODUCTS":
                        LISTMATCHINGPRODUCTS();
                        break;
                    default:
                        break;
                }
            });

    }
}


function LOWESTPRICEDOFFERSFORASIN(asin) {
    console.log('                        LOWESTPRICEDOFFERSFORASIN();');
    amazonMws.products.searchFor({
        'Version': '2011-10-01',
        'Action': 'GetLowestPricedOffersForASIN',
        'SellerId': SellerID,
        'MWSAuthToken': MWSAuthToken,
        'MarketplaceId': 'ATVPDKIKX0DER',
        'ASIN': asin,
        'ItemCondition': 'New'
    }, function (error, response) {
        if (error) {
            console.log('error products', error);
            return;
        }
        console.log('response ', response);
    });

};
function LOWESTPRICEDOFFERSFORSKU(sku) {
    console.log('                        LOWESTPRICEDOFFERSFORSKU();');
    amazonMws.products.searchFor({
        'Version': '2011-10-01',
        'Action': 'GetLowestPricedOffersForSKU',
        'SellerId': SellerID,
        'MWSAuthToken': MWSAuthToken,
        'MarketplaceId': 'ATVPDKIKX0DER',
        'SellerSKU': sku,
        'ItemCondition': 'New'
    }, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        console.log('response ', response);
    });

};
function MATCHINGPRODUCT() {
    console.log('                        MATCHINGPRODUCT();');
};
function MATCHINGPRODUCTFORSEVERALASINS() {
    console.log('                         MATCHINGPRODUCTFORSEVERALASINS();');
};
function LISTMATCHINGPRODUCTS() {
    console.log('                        LISTMATCHINGPRODUCTS();');
};

function TODO() //TODO:
{
    amazonMws.products.searchFor({
        'Version': '2011-10-01',
        'Action': 'GetLowestPricedOffersForASIN',
        'SellerId': SellerID,
        'MWSAuthToken': MWSAuthToken,
        'MarketplaceId': 'ATVPDKIKX0DER',
        'ASIN': 'B07235DD62',
        'ItemCondition': 'New'
    }, function (error, response) {
        if (error) {
            console.log('error products', error);
            return;
        }
    });


    amazonMws.products.search({
        'Version': '2011-10-01',
        'Action': 'ListMatchingProducts',
        'SellerId': SellerID,
        'MWSAuthToken': MWSAuthToken,
        'MarketplaceId': 'ATVPDKIKX0DER',
        'Query': 'shoes'
    }, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        // console.log('response', response);

        for (let i = 0; i < response.Products.Product.length; i++) {
            console.log(response.Products.Product[i].AttributeSets);
        }
    });
}

console.log("Thanks for researching Products!");
