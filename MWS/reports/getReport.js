const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const SellerId = process.env.MWS_SELLER_ID;
const connection = require('../../config/connection')

const reports = {

    reportRequest: function (id) {
        return new Promise(function (resolve, reject) {
            amazonMws.reports.search({
                'Version': '2009-01-01',
                'Action': 'GetReport',
                'SellerId': SellerId,
                'MWSAuthToken': MWSAuthToken,
                'ReportId': id
            }, function (error, response) {
                if (error) {
                    console.log('error ', error);
                    return;
                }
                resolve(response.data);
            });
        })
    },
}



module.exports = reports;
// reports.reportRequest('14202993481017984');
