const moment = require('moment');
const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const SellerID = process.env.MWS_SELLER_ID;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const connection = require('../config/connection')




//Create a new date and subtract 2 minutes to get the most recent allowable request time.
const ordersObject = orders();
function orders() {
    const now = new Date();
    const requestTime = now;
    requestTime.setMinutes(now.getMinutes() - 3);
    let updateAfter = '';
    const updateBefore = requestTime;
    getLastRunDate();
    let action = `ListOrders`;

    return Object.freeze({
        action: action,
        updateAfter: updateAfter,
        updateBefore: requestTime,
        getLastRunDate,
        request,
        updateOrders
    })


    function getLastRunDate() {
        const queryString = "SELECT MIN(PurchaseDate)as date FROM orders WHERE OrderStatus = 'Pending' ;"
        connection.query(queryString, function (err, res) {
            if (res) {

                date = new Date(res[0].date);
                updateAfter = moment(date.setDate(date.getDate())).toISOString();
            } else {
                date = new Date();
            }
            request();
            // Call updateProduct AFTER the INSERT completes
        }
        )
    };

    function request(NextToken) {

        // WITH NEXT TOKEN
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

                //WITHOUT NEXT TOKEN
                'Version': '2013-09-01',
                'Action': action,
                'SellerId': SellerID,
                'MWSAuthToken': MWSAuthToken,
                'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
                'LastUpdatedAfter': updateAfter,
                'LastUpdatedBefore': updateBefore,
            }, (error, response) => {
                if (error) {
                    console.log("pendingOrderUpdater: " + 'request error Code: ', error.Code);
                    if (error.Code == 'RequestThrottled') {
                        console.log("pendingOrderUpdater: " + 'request throttled: Restarting in 15 seconds ' + NextToken);
                        setTimeout(
                            function () { request(NextToken) }, 15000);
                    }
                    return;
                }
                const orders = response.Orders.Order;
                updateOrders(orders);
                if (response.NextToken) {
                    NextToken = (response.NextToken);
                    action = 'ListOrdersByNextToken'
                    setTimeout(
                        function () { request(NextToken) }, 15000);
                }
                return;
            });
    };

    function updateOrders(orders) {
        orders.forEach(order => {
            const queryString = "SELECT * FROM orders WHERE ?";
            const queryParams = { AmazonOrderId: order.AmazonOrderId }
            connection.query(queryString, queryParams,
                (err, response) => {
                    if (response[0] && response[0].OrderStatus == "Pending") {
                        updateOrder(order);
                    }
                });
        });
    };


    function updateOrder(order) {
        if (order.OrderStatus === 'Pending') {
            console.log("Still Pending");
        }
        else {

            console.log("pendingOrderUpdater: " + "Updating a pending order");
            const queryString = `UPDATE orders SET ? WHERE ?;`
            const queryParams = [{
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
            }, { AmazonOrderId: order.AmazonOrderId }];
            connection.query(queryString, queryParams,
                function (err, res) {
                    if (err) {
                        console.log("pendingOrderUpdater: " + err);
                    }
                    console.log("pendingOrderUpdater: " + JSON.stringify(res, null, 2) + " order inserted!\n");
                }
            )
        }
    };
};



