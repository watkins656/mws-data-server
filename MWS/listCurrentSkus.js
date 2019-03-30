const dotenv = require("dotenv").config({ path: __dirname + '/../.env' });
const connection = require('../config/connection');
const SKUsArray = [];


const skuList = {

    list: function (days) {
        return new Promise(function (resolve, reject) {
            let date = new Date('1994-07-05') //Day Amazon Launches
            if (days) {
                date = new Date();
                date.setDate(date.getDate() - days);
                function formatDate(date) {
                    var day = date.getDate();
                    var monthIndex = date.getMonth();
                    monthIndex++;
                    var year = date.getFullYear();
                    if (day < 10) {
                        day = '0' + day;
                    }
                    if (monthIndex < 10) {
                        monthIndex = '0' + monthIndex;
                    }

                    return "'" + year + '-' + (monthIndex) + '-' + day + "'";
                }

                date = (formatDate(date));
                console.log(date);
            }
            let queryString = `SELECT SellerSKU FROM order_items WHERE createdAt > ${date} GROUP BY SellerSKU`;
            console.log(queryString);
            const query = connection.query(queryString,
                (err, res) => {
                    res.forEach(SellerSKU => {
                        SKUsArray.push(SellerSKU.SellerSKU);
                    });
                    resolve(SKUsArray);
                })
        })
    },
}

module.exports = skuList;