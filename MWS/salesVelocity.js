const moment = require('moment');
const _ = require('underscore')
const connection = require('../config/connection');



const salesVelocity = {
    salesByDay: function (msku) {
        const queryString = `SELECT
        o.AmazonOrderId,
        o.PurchaseDate,
        i.SellerSKU,
        i.QuantityOrdered
        FROM
        orders o
        LEFT JOIN order_items i ON o.AmazonOrderId = i.AmazonOrderId
        WHERE ?`
        const SKU = { SellerSKU: msku }
        connection.query(queryString, SKU,
            (err, results) => {
                const dateArr = [];
                results.forEach(element => {
                    const orderQty = element.QuantityOrdered;
                    for (i = 0; i < orderQty; i++) {
                        dateArr.push(moment(element.PurchaseDate).format("MM-DD-YYYY"));
                    }
                });
                const counts = _.countBy(dateArr);
                console.log(counts);
                return (counts);
            })
    },

    // gets sales for last 'X' days
    salesForLastXDays: function (msku, days) {

        const queryString = `SELECT
        o.AmazonOrderId,
        o.PurchaseDate,
        i.SellerSKU,
        i.QuantityOrdered
        FROM
        orders o
        LEFT JOIN order_items i ON o.AmazonOrderId = i.AmazonOrderId
        WHERE ?`
        const SKU = { SellerSKU: msku }
        connection.query(queryString, SKU,
            (err, results) => {
                const dateArr = [];
                results.forEach(element => {
                    const orderQty = element.QuantityOrdered;
                    for (i = 0; i < orderQty; i++) {
                        dateArr.push(new Date(moment(element.PurchaseDate).format("MM-DD-YYYY")));
                    }
                });
                const maxDate = moment();
                let counts = 0;

                dateArr.forEach(date => {
                    const diff = maxDate.diff(moment(date), 'days');
                    if (diff <= days) {
                        counts++
                    }
                });
                console.log("Sold " + counts + " units of "+msku+" in the last " + days + " days!");
                return (counts);
            })
    },
}

module.exports = salesVelocity;

