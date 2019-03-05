const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const SellerId = process.env.MWS_SELLER_ID;
const connection = require('../../config/connection')

const reportListRequest = function () {

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

        return;
    });
};


function reportRequest() {
    amazonMws.reports.search({
        'Version': '2009-01-01',
        'Action': 'GetReport',
        'SellerId': SellerId,
        'MWSAuthToken': MWSAuthToken,
        'ReportId': '13876013266017960'
    }, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        response.data.forEach(element => {
            reports.updateInventoryHealthTable(element);
        });
        const removeDuplicates = `DELETE t1 FROM InventoryHealths t1 INNER JOIN InventoryHealths t2 WHERE t2.id > t1.id AND t1.sku = t2.sku;`
        connection.query(removeDuplicates, (err, res) => {
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

const reports = {

    updateInventoryHealthTable: function (item) {
        //TODO: CODE to update the inv. health table with the 'item' object.  

        const queryString = "INSERT INTO InventoryHealths SET ?";
        connection.query(queryString, item, (err, res) => {
            console.log(res.affectedRows + " order inserted!\n");
            // Call updateProduct AFTER the INSERT completes
        }
        )


    }
}



