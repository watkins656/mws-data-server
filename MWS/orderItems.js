let dotenv = require("dotenv").config({ path: __dirname + '/../.env' });

var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let mySQLPassword = process.env.MYSQL_PASSWORD;
let MWSAuthToken = process.env.MWS_AUTH_TOKEN;
var mysql = require("mysql");
let connection = require('../config/connection');

let counter = 0;
let orderItems = orderItemsBuild();
setInterval(() => {orderItems.getOrders()}, 900000);
orderItems.getOrders();




function orderItemsBuild() {
    let SellerId = process.env.MWS_SELLER_ID;
    let AmazonOrderId = '';



    return Object.freeze({
        SellerId: SellerId,
        AmazonOrderId: AmazonOrderId,
        request,
        getOrders,
        insertOrderItem,
        insertOrderItems,
        removeDuplicates
    })

    function request(id) {
        console.log('requesting order item for id: ' + id);
        AmazonOrderId = id;
        amazonMws.orders.search({
            'Version': '2013-09-01',
            'Action': 'ListOrderItems',
            'SellerId': SellerId,
            'MWSAuthToken': 'amzn.mws.a2ab3b35-11d4-be30-d53d-8cc985b091ae',
            'AmazonOrderId': AmazonOrderId
        }, (error, response) => {
            if (error) {
                console.log('error ', error);
                if (error.Code == 'RequestThrottled') {
                    console.log('restarting due to request throttled');
                    setTimeout(
                        function () { request(id) }, 9000);

                }
                return;
            }
            let orderItems = response.OrderItems.OrderItem
            orderItems.AmazonOrderId = id;
            insertOrderItem(orderItems);
        });
    };

    function removeDuplicates() {
        let query = connection.query("DELETE t1 FROM order_items t1 INNER JOIN order_items t2 WHERE t2.id < t1.id AND t1.`OrderItemId` = t2.`OrderItemId`;", (err, results) => {
            if (err) {
                console.log(err);
            }
            if (results) { console.log(results); }
        })
    };
    function getOrders() {
        removeDuplicates();

        console.log("Getting Orders");
        var query = connection.query(`SELECT AmazonOrderId
        FROM orders AS a
        WHERE NOT EXISTS (
          SELECT AmazonOrderId
          FROM order_items AS b 
          WHERE a.AmazonOrderId=b.AmazonOrderId 
        )
        LIMIT 1000;
        `, (err, results) => {
            if (err) { console.log('error: ' + err); }
            else {
                newArray = [];
                results.forEach(element => {
                    console.log("order ID: " + element.AmazonOrderId);
                    
                    let q = connection.query("SELECT * FROM order_items WHERE ?", { AmazonOrderId: element.AmazonOrderId },
                        (err, response) => {
                            if (err) {
                                console.log(err);
                            }
                            console.log(response.length);
                            if (response.length == 0) {
                                newArray.push(element.AmazonOrderId);
                            }
                        });
                });

                var curIndex = -1;

                var intervalID = setInterval(function () {
                    ++curIndex;
                    if (curIndex >= newArray.length) {
                        return
                    }
                    request(newArray[curIndex]);   // set new news item into the loop
                }, 2000);

            }
        });
    };

    function insertOrderItems(orders) {
        orders.forEach(order => {
            insertOrderItem(order);
        });
    };

    function insertOrderItem(order) {
        console.log("Inserting a new item for order: " + order.AmazonOrderId + "\n");
        var query = connection.query(
            "INSERT INTO order_items SET ?",
            {
                AmazonOrderId: order.AmazonOrderId,
                QuantityOrdered: order.QuantityOrdered,
                Title: order.Title,
                PromotionDiscount: order.PromotionDiscount,
                IsGift: order.IsGift,
                ASIN: order.ASIN,
                SellerSKU: order.SellerSKU,
                OrderItemId: order.OrderItemId,
                IsTransparency: order.IsTransparency,
                ProductInfo: order.ProductInfo,
                QuantityShipped: order.QuantityShipped,
                ItemPrice: order.ItemPrice,
                ItemTax: order.ItemTax,
                PromotionDiscountTax: order.PromotionDiscountTax
            },
            (err, res) => {
                if (err) console.log(err);
                else
                    console.log(res + " order inserted!\n");
                // Call updateProduct AFTER the INSERT completes
            }
        )
    };
};

