const dotenv = require("dotenv").config({ path: __dirname + '/../.env' });

const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const mySQLPassword = process.env.MYSQL_PASSWORD;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const mysql = require("mysql");
const connection = require('../config/connection');

const counter = 0;
const orderItems = orderItemsBuild();
setInterval(() => { orderItems.getOrders() }, 900000);
orderItems.getOrders();




function orderItemsBuild() {
    const SellerId = process.env.MWS_SELLER_ID;
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
        console.log("orderItems: " + 'requesting order item for id: ' + id);
        AmazonOrderId = id;
        amazonMws.orders.search({
            'Version': '2013-09-01',
            'Action': 'ListOrderItems',
            'SellerId': SellerId,
            'MWSAuthToken': 'amzn.mws.a2ab3b35-11d4-be30-d53d-8cc985b091ae',
            'AmazonOrderId': AmazonOrderId
        }, (error, response) => {
            if (error) {
                console.log("orderItems: " + 'error ', error);
                if (error.Code == 'RequestThrottled') {
                    console.log("orderItems: " + 'restarting due to request throttled');
                    setTimeout(
                        function () { request(id) }, 9000);

                }
                return;
            }
            const orderItems = response.OrderItems.OrderItem
            orderItems.AmazonOrderId = id;
            insertOrderItem(orderItems);
        });
    };

    function removeDuplicates() {
        console.log("Removing Duplicates");
        const queryString = "DELETE t1 FROM order_items t1 INNER JOIN order_items t2 WHERE t2.id < t1.id AND t1.`OrderItemId` = t2.`OrderItemId`;";
        connection.query(queryString,
            (err, results) => {
                if (err) {
                    console.log("orderItems: " + err);
                }
                if (results) { console.log("orderItems: Removed Duplicates" + results); }
            })
        const queryString2 = "DELETE t1 FROM orders t1 INNER JOIN orders t2 WHERE t2.id < t1.id AND t1.`AmazonOrderId` = t2.`AmazonOrderId`;";
        connection.query(queryString2,
            (err, results) => {

                if (err) {
                    console.log("orders: " + err);
                }
                if (results) { console.log("orders: Removed Duplicates" + results); }
            })
    };
    function getOrders() {

        console.log("orderItems: " + "Getting Orders");
        const query = connection.query(`SELECT AmazonOrderId
        FROM orders AS a
        WHERE NOT EXISTS (
            SELECT AmazonOrderId
            FROM order_items AS b 
            WHERE a.AmazonOrderId=b.AmazonOrderId 
            )
            LIMIT 200;
            `, (err, results) => {
                if (err) { console.log("orderItems: " + 'error: ' + err); }
                else {
                    console.log('results from getOrders');
                    console.log(results);
                    newArray = [];
                    results.forEach(element => {
                        console.log("orderItems: " + "order ID: " + element.AmazonOrderId);

                        const queryString = "SELECT * FROM order_items WHERE ?";
                        const queryParams = { AmazonOrderId: element.AmazonOrderId };
                        connection.query(queryString, queryParams,
                            (err, response) => {
                                if (err) {
                                    console.log("orderItems: " + err);
                                }
                                console.log("orderItems: " + response.length);
                                if (response.length == 0) {
                                    newArray.push(element.AmazonOrderId);
                                }
                            });
                    });

                    let curIndex = -1;

                    const intervalID = setInterval(function () {
                        ++curIndex;
                        if (curIndex >= newArray.length) {
                            return
                        }
                        request(newArray[curIndex]);   // set new news item into the loop
                    }, 2000);

                    removeDuplicates();
                }
            });
    };

    function insertOrderItems(orders) {
        orders.forEach(order => {
            insertOrderItem(order);
        });
    };

    function insertOrderItem(order) {
        console.log("orderItems: " + "Inserting a new item for order: " + order.AmazonOrderId + "\n");
        const query = connection.query(
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
                if (err) console.log("orderItems: " + err);
                else
                    console.log("orderItems: " + res + " order inserted!\n");
                // Call updateProduct AFTER the INSERT completes
            }
        )
    };
};

