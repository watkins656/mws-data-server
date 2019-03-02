let moment = require('moment');
let _ = require('underscore')
let connection = require('../config/connection');

let salesVelocity = {
    SKUsArray: [1, 2],
    main: function () {
        var query = connection.query(`SELECT SellerSKU from order_items GROUP BY SellerSKU ORDER BY SellerSKU`, (err, results) => {
            let arr = [];
            results.forEach(element => {
                if (element.SellerSKU)
                    this.SKUsArray.push(element.SellerSKU);
            });
            return;
        })
    },
    salesByDay: function (msku) {
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
    },

    // gets sales for last 'X' days
    salesForLastXDays: function (msku, days) {
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
                        dateArr.push(new Date(moment(element.PurchaseDate).format("MM-DD-YYYY")));
                    }
                });
                var maxDate = new Date(Math.max.apply(null, dateArr));
                var counts = 0;
                console.log(maxDate.getDate());
                dateArr.forEach(date => {
                    let diff = maxDate.getDate() - date.getDate();
                    if (diff < days) {
                        counts++
                    }
                });
                console.log("Sold " + counts + " items in the last " + days + " days!");
                return (counts);
            })
    },

    getAllSellerSKUs: function () {

    }
}
salesVelocity.salesByDay('Slim Jim Bacon Jerky 8-pack');
salesVelocity.salesForLastXDays('Slim Jim Bacon Jerky 8-pack', 7);

