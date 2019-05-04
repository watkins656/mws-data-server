'use strict';

var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const SellerID = process.env.MWS_SELLER_ID;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;

const amazonMws = require('amazon-mws')(accessKey, accessSecret);

var financeRequest = function (nextToken) {
    console.log("Finances");

    let searchObject = {
        'Version': '2015-05-01',
        // ListFinancialEventGroups || ListFinancialEventGroupsByNextToken || ListFinancialEvents || ListFinancialEventsByNextToken || GetServiceStatus
        'Action': 'ListFinancialEvents',
        'SellerId': SellerID,
        'MWSAuthToken': MWSAuthToken,
        // 'FinancialEventGroupStartedAfter': new Date(2016, 11, 24),
        'FinancialEventGroupId': 'vD7QaxNAo9A-XrmDLRLWki4PZxaqC3HJKD2G97N4Bmk'
    }
    if (nextToken) {
        searchObject.nextToken = nextToken;
    }
    amazonMws.finances.search(searchObject, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        let financialEvents = response.FinancialEvents;
        // console.log('response', response);
        Object.keys(financialEvents).map(function (event, index) {

            if (!(Object.keys(financialEvents[event]).length === 0 && financialEvents[event].constructor === Object)) {
                console.log(event);
            }
        });
        if (response.NextToken) {
            console.log(response.NextToken);
            financeRequest(response.NextToken)
        }


    });
};

financeRequest();