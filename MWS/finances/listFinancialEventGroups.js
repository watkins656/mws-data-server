'use strict';

var accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
var accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const SellerID = process.env.MWS_SELLER_ID;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;

const amazonMws = require('amazon-mws')(accessKey, accessSecret);

var financeRequest = function () {
    console.log("Finances");

    
    amazonMws.finances.search({
        'Version': '2015-05-01',
    // ListFinancialEventGroups || ListFinancialEventGroupsByNextToken || ListFinancialEvents || ListFinancialEventsByNextToken || GetServiceStatus
        'Action': 'ListFinancialEventGroups',
        'SellerId': SellerID,
        'MWSAuthToken': MWSAuthToken,
        'FinancialEventGroupStartedAfter': new Date(2016, 11, 24)
    }, function (error, response) {
        if (error) {
            console.log('error ', error);
            return;
        }
        console.log('response', response.FinancialEventGroupList.FinancialEventGroup[1]);
    });
};

financeRequest();