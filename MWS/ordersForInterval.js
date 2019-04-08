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
    })

    function getLastRunDate() {
        const queryString = "SELECT MAX(PurchaseDate)as date FROM orders";
        connection.query(queryString,
            function (err, res) {
                if (res) {
                    date = new Date(res[0].date);
                    updateAfter = moment(date.setDate(date.getDate() - 1)).toISOString();
                } else {
                    date = new Date();
                }
                request();
            }
        )
    };

    function request(NextToken) {
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
                        setTimeout(
                            function () { request(NextToken) }, 180000);
                    }
                    return;
                }
                const orders = response.Orders.Order;
                insertOrders(orders);
                if (response.NextToken) {
                    NextToken = (response.NextToken);
                    action = 'ListOrdersByNextToken'
                    setTimeout(
                        function () {
                            request(NextToken)
                        }, 1000);
                }
                else {
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
                if (err) {
                    console.log("ordersForInterval: " + err);
                }
            }
        )
    };
};
