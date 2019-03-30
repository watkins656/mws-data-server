'use strict';
// Read and set environment variables
const dotenv = require("dotenv").config();
const listCurrentSkus = require("./listCurrentSkus");
const salesVelocity = require("./salesVelocity");

const MWSTest = function () {
    // const orders = require("./ordersForInterval");
    const reports = require("./reports");
    
}
const MWS = function () {
    // //function that outputs sales for a given sku
    const listCurrentSkus = require("./listCurrentSkus");

    //Gets all SKUs with any sales in last (XX) days and then reports the units sold in last (X) days;   
    listCurrentSkus.list(23).then(function (list) {
        list.forEach(sku => {
            salesVelocity.salesForLastXDays(sku, 7);
        });
    });

    // //gets new orders
    const orders = require("./ordersForInterval");

    // //gets the items from the orders
    //TODO: Chain this using a promise so that it runs AFTER the orders function completes
    const orderItems = require("./orderItems");

    // //checks pending items and updates them to 'shipped'
    const pendingOrderUpdater = require("./pendingOrderUpdater");

    // //updates current inventory
    const inventory = require("./inventory");


    // //function that outputs sales by Day/Week/Month for a given sku
    const salesVelocity = require("./salesVelocity");

    // //function that updates various reports
    const reports = require("./reports");

    //returns the necessary Sales Velocity needed to avoid expiration of products 
    const overstock = require("./overstock");
}


MWS();
// MWSTest();