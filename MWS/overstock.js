let dotenv = require("dotenv").config({ path: __dirname + '/../.env' });
let _ = require('underscore')
let connection = require('../config/connection');

const overstock = {
    salesNeededPerDay: function () {
        console.log('ok');
        const queryString = `SELECT 
        Name, 
        Count(Name) as Count, 
        SUM(Quantity) as TotalQuantity,
        MIN(ExpirationDate) as Expiration,  
        datediff(MIN(ExpirationDate),(curdate()+interval 105 day)) as DaysTilAmazonExpiration,
        SUM(Quantity)/datediff(MIN(ExpirationDate),(curdate()+interval 105 day)) as SalesNeededPerDay
        FROM g19kgxd0tyqbpecb.overstock_inventory GROUP BY Name ORDER BY SalesNeededPerDay Desc`;
        let query = connection.query(queryString,
            (err, res) => {
                if (err) {
                    console.log(err);
                }
                return res
                //TODO: resolve response in a Promise
            }
        )
    },
    getItemsByMaxExpirationDate(maxExpDate) {
        const queryString = `SELECT Name, Quantity, ExpirationDate, Location FROM overstock_inventory WHERE ExpirationDate <`
        let query = connection.query(
            queryString, maxExpDate,
            (err, res) => {
                if (err) {
                    console.log(err);
                }
                return res

            }
        )
    }
}

module.exports = overstock;