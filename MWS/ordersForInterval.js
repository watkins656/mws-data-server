const moment = require('moment');
const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const SellerID = process.env.MWS_SELLER_ID;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const inquirer = require('inquirer');
const connection = require('../config/connection')




//Create a new date and subtract 2 minutes to get the most recent allowable request time.
const ordersObject = orders();
function orders() {
    const now = new Date();
    const requestTime = now;
    requestTime.setMinutes(now.getMinutes() - 2);
    let updateAfter = '';
    const updateBefore = requestTime;
    const action = `ListOrders`;
    getLastRunDate();

    return Object.freeze({
        action: action,
        updateAfter: updateAfter,
        updateBefore: requestTime,
        getLastRunDate,
        request,
        insertOrders,
        insertOrder,
        main
    })


    function getLastRunDate() {
        console.log("ordersForInterval: " + "Checking for Orders");
        const queryString = "SELECT MAX(PurchaseDate)as date FROM orders";
        connection.query(queryString,
            function (err, res) {
                if (res) {
                    date = new Date(res[0].date);
                    updateAfter = moment(date.setDate(date.getDate() - 1)).toISOString();
                    console.log("ordersForInterval: " + "update after: " + updateAfter);
                } else {
                    date = new Date();
                }
                request();
            }
        )
    };

    function request(NextToken) {
        console.log("ordersForInterval: " + "Checking for new Orders");
        amazonMws.orders.search((NextToken) ? {
            'Version': '2013-09-01',
            'Action': action,
            'SellerId': SellerID,
            'MWSAuthToken': MWSAuthToken,
            'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
            'LastUpdatedAfter': updateAfter,
            'LastUpdatedBefore': updateBefore,
            'NextToken': NextToken,
        } : {
                'Version': '2013-09-01',
                'Action': action,
                'SellerId': SellerID,
                'MWSAuthToken': MWSAuthToken,
                'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
                'LastUpdatedAfter': updateAfter,
                'LastUpdatedBefore': updateBefore,
            }, (error, response) => {
                if (error) {
                    console.log("ordersForInterval: " + 'request error Code: ', error.Code);
                    if (error.Code == 'RequestThrottled') {
                        console.log("ordersForInterval: " + 'restarting due to request throttled');
                        setTimeout(
                            function () { request(NextToken) }, 180000);
                    }
                    return;
                }
                const orders = response.Orders.Order;
                insertOrders(orders);
                if (response.NextToken) { console.log("ordersForInterval: " + 'Next Token: ' + response.NextToken); }
                if (response.NextToken) {
                    NextToken = (response.NextToken);
                    console.log("ordersForInterval: " + NextToken);
                    action = 'ListOrdersByNextToken'
                    setTimeout(
                        function () { console.log("ordersForInterval: " + 'timeout'); request(NextToken) }, 1000);
                }
                else {
                    console.log("ordersForInterval: " + "No More Orders! Checking again in 5 minutes");
                    setTimeout(
                        function () { request() }, 300000);
                }
                return;
            });
    };

    function insertOrders(orders) {
        orders.forEach(order => {
            const queryString = "SELECT AmazonOrderId FROM orders WHERE ?";
            const queryParams = { AmazonOrderId: order.AmazonOrderId };
            connection.query(queryString, queryParams,
                (err, response) => {
                    if (response.length == 0) {
                        insertOrder(order);
                    }
                    else { //console.log("ordersForInterval: " + "order already in database");
                    }
                });
        });
    };

    function insertOrder(order) {
        const queryString = "INSERT INTO orders SET ?";
        const queryParams = {

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
        };
        connection.query(queryString, queryParams,

            function (err, res) {
                console.log("ordersForInterval: " + err);
                console.log("ordersForInterval: " + res.affectedRows + " order inserted!\n");
                // Call updateProduct AFTER the INSERT completes
            }
        )
    };
    function main() {
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
                        getLastRunDate();
                        request();
                        break;
                    case "GET SALES VELOCITY FOR SKU":
                        const salesVelocity = require('./salesVelocity.js');
                        salesVelocity.main();
                        break;
                    case "CHECK PAR LEVELS FOR SKU":
                        require('./PAR.js');
                        break;

                    default:
                        break;
                }
            });
    };

};
