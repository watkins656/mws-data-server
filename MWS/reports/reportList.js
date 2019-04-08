const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const SellerId = process.env.MWS_SELLER_ID;
const connection = require('../../config/connection')

let reportList = {
    reportRequestByType: function (reportType) {
        return new Promise(function (resolve, reject) {

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
                let reports = response.ReportInfo;
                let report = findCurrentReportByType(reportType, reports);
                resolve(report);
            });
        });
    }
}
function findCurrentReportByType(reportType, reports) {
    let found = false;
    let i = 0;
    while (!found) {
        if (reports[i]["ReportType"] === reportType) {
            found = true;
            return reports[i];
        }
        i++;
    }
}


module.exports = reportList;


