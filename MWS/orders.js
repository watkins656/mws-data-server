let dotenv = require("dotenv").config();
var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let mySQLPassword = process.env.MYSQL_PASSWORD;
let SellerID = process.env.MWS_SELLER_ID;
let MWSAuthToken = process.env.MWS_AUTH_TOKEN;
let mysql = require("mysql");
let inquirer = require('inquirer');
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: mySQLPassword,
    database: "amazon"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
});




//Create a new date and subtract 2 minutes to get the most recent allowable request time.
let now = new Date();
let requestTime = now;
requestTime.setMinutes(now.getMinutes() - 3);


let orders = {
    action: 'ListOrders',
    updateAfter: new Date('2018-11-01'),    //TODO: update with successful response
    updateBefore: requestTime,
    getLastRunDate: function () {
        let query = connection.query(
            "SELECT MAX(PurchaseDate)as date FROM orders",
            function (err, res) {
                console.log(JSON.stringify(res) + " is your date!\n");
                date = new Date(res[0].date)
                this.updateAfter = date.setDate(date.getDate() - 3)
                console.log(this.updateAfter);
                // Call updateProduct AFTER the INSERT completes
            }
        )


    },
    //create request
    request: function () {
        this.getLastRunDate();
        amazonMws.orders.search({
            'Version': '2013-09-01',
            'Action': this.action,
            'SellerId': SellerID,
            'MWSAuthToken': MWSAuthToken,
            'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
            'LastUpdatedAfter': this.updateAfter,
            'LastUpdatedBefore': this.updateBefore,
        }, (error, response) => {
            if (error) {
                console.log('request error ', error);
                return;
            }
            let orders = response.Orders.Order;
            this.insertOrders(orders);
            if (response.NextToken) {
                this.NextToken = (response.NextToken);
                this.action = 'ListOrdersByNextToken'
                // this.request();
            }
            else {
                require('./orderItems.js');
                this.main();
            }
        });
    },

    insertOrders: function (orders) {
        orders.forEach(order => {
            let q = connection.query("SELECT AmazonOrderId FROM orders WHERE ?", { AmazonOrderId: order.AmazonOrderId },
                (err, response) => {
                    if (response.length == 0) {
                        this.insertOrder(order);
                    }
                });
        });
    },
    insertOrder: function (order) {
        let query = connection.query(
            "INSERT INTO orders SET ?",
            {

                AmazonOrderId: order.AmazonOrderId,
                BuyerEmail: order.BuyerEmail,
                BuyerName: order.BuyerName,
                EarliestShipDate: order.EarliestShipDate,
                FulfillmentChannel: order.FulfillmentChannel,
                IsBusinessOrder: order.IsBusinessOrder,
                IsPremiumOrder: order.IsPremiumOrder,
                IsPrime: order.IsPrime,
                IsReplacementOrder: order.IsReplacementOrder,
                LastUpdateDate: order.LastUpdateDate,
                LatestShipDate: order.LatestShipDate,
                MarketplaceId: order.MarketplaceId,
                NumberOfItemsShipped: order.NumberOfItemsShipped,
                NumberOfItemsUnshipped: order.NumberOfItemsUnshipped,
                OrderStatus: order.OrderStatus,
                OrderTotal: order.OrderTotal,
                OrderType: order.OrderType,
                PaymentMethod: order.PaymentMethod,
                PaymentMethodDetails: order.PaymentMethodDetails,
                PurchaseDate: order.PurchaseDate,
                SalesChannel: order.SalesChannel,
                SellerOrderId: order.SellerOrderId,
                ShipServiceLevel: order.ShipServiceLevel,
                ShipmentServiceLevelCategory: order.ShipmentServiceLevelCategory,
                ShippingAddress: order.ShippingAddress
            },
            function (err, res) {
                console.log(res.affectedRows + " order inserted!\n");
                // Call updateProduct AFTER the INSERT completes
            }
        )
    },
    main: function () {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "list",
                    message: "What would you like to do?",
                    choices: ["UPDATE DATABASE WITH LATEST ORDERS (Recommended)", "GET SALES VELOCITY FOR SKU", "CHECK PAR LEVELS FOR ASIN"],
                    name: "action"
                },
            ])
            .then((res) => {
                switch (res.action) {
                    case "UPDATE DATABASE WITH LATEST ORDERS (Recommended)":
                    this.getLastRunDate();
                        this.request();
                        break;
                    case "GET SALES VELOCITY FOR SKU":
                        let salesVelocity = require('./salesVelocity.js');
                        salesVelocity.main();
                        break;
                    case "CHECK PAR LEVELS FOR SKU":
                        require('./PAR.js');
                        break;

                    default:
                        break;
                }
            });
    }
}

orders.main();