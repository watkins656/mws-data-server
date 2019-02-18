let dotenv = require("dotenv").config({ path: __dirname + '/../.env' });
var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
let mySQLPassword = process.env.MYSQL_PASSWORD;
let amazonMws = require('amazon-mws')(accessKey, accessSecret);
let MWSAuthToken = process.env.MWS_AUTH_TOKEN;
let SellerId = process.env.MWS_SELLER_ID;
let mysql = require("mysql");
let inquirer = require('inquirer');
let fs = require('fs')
let connection = require('../config/connection')

let reportListRequest = function () {

    amazonMws.reports.search({
        'Version': '2009-01-01',
        'Action': 'GetReportList',
        'SellerId': SellerId,
        'MWSAuthToken': MWSAuthToken,
        //'ReportTypeList.Type.1': 'REPORT_TYPE_LIST' //optional
    }, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        console.log('response', response);
    });
};


function reportRequest() {
    amazonMws.reports.search({
        'Version': '2009-01-01',
        'Action': 'GetReport',
        'SellerId': SellerId,
        'MWSAuthToken': MWSAuthToken,
        'ReportId': '12383591239017863'
    }, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        response.data.forEach(element => {
            reports.updateInventoryHealthTable(element);
        });
        let removeDuplicates = connection.query(`DELETE t1 FROM inventory_health t1 INNER JOIN inventory_health t2 WHERE t2.id > t1.id AND t1.sku = t2.sku;`, (err, res) => {
                if (err)
                    console.log(err);
                else
                    console.log(res);
            })

        return;
    });
};
// reportListRequest();
reportRequest();

let reports = {

    updateInventoryHealthTable: function (item) {
        //TODO: CODE to update the inv. health table with the 'item' object.  
        var query = connection.query(
            "INSERT INTO inventory_health SET ?",
            item,
            function (err, res) {
                console.log(err);
                console.log(res.affectedRows + " order inserted!\n");
                // Call updateProduct AFTER the INSERT completes
            }
        )


    }
}



