const accessKey = process.env.AWS_ACCESS_KEY_ID || 'YOUR_KEY';
const accessSecret = process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET';
const amazonMws = require('amazon-mws')(accessKey, accessSecret);
const SellerId = process.env.MWS_SELLER_ID;
const MWSAuthToken = process.env.MWS_AUTH_TOKEN;
const _ = require('underscore')
const connection = require('../config/connection');
const inventory = inventoryBuild();

function inventoryBuild() {

    return Object.freeze({
        fulfillmentInventoryRequest,
        insertInventory,
        insertItem,
        })
    function insertInventory(inventory) {
        inventory.forEach(item => {
            insertItem(item);
        });
    };
    function insertItem(item) {
        const query = connection.query(
            "INSERT INTO inventory_supply SET ?",
            {
                Condition: item.Condition,
                SupplyDetail: item.SupplyDetail,
                TotalSupplyQuantity: item.TotalSupplyQuantity,
                FNSKU: item.FNSKU,
                InStockSupplyQuantity: item.InStockSupplyQuantity,
                ASIN: item.ASIN,
                SellerSKU: item.SellerSKU
            },
            (err, res) => {
                if (err) {
                    console.log("inventory: " + err);
                }
                else {
                    console.log("inventory: " + res.affectedRows + " order inserted!\n");
                }
            }
        )
    };
    function fulfillmentInventoryRequest(nextToken) {
        nextToken ? console.log("inventory: " + 'running with nextToken: ' + nextToken) : console.log("inventory: " + 'Initial Request');
        amazonMws.fulfillmentInventory.search((nextToken) ? {
            'Version': '2010-10-01',
            'Action': 'ListInventorySupplyByNextToken',
            'SellerId': SellerId,
            'MWSAuthToken': MWSAuthToken,
            'MarketplaceId': 'ATVPDKIKX0DER',
            'QueryStartDateTime': new Date(2016, 9, 24),
            'NextToken': NextToken,
        } : {
                'Version': '2010-10-01',
                'Action': 'ListInventorySupply',
                'SellerId': SellerId,
                'MWSAuthToken': MWSAuthToken,
                'MarketplaceId': 'ATVPDKIKX0DER',
                'QueryStartDateTime': new Date(2016, 9, 24)
            }, (error, response) => {
                if (error) {
                    console.log("inventory: " + 'fulfillmentInventory error Code: ', error.Code);
                    if (error.Code == 'RequestThrottled') {
                        console.log("inventory: " + 'restarting due to request throttled');
                        setTimeout(
                            function () { fulfillmentInventoryRequest(nextToken) }, 1000);
                    }
                    return;
                }
                const inventory = response.InventorySupplyList.member; // TODO: This is an array of my Amazon FBA Inventory supply.  Insert this into mySQL database 
                insertInventory(inventory);
                if (response.NextToken) {
                    NextToken = (response.NextToken);
                    setTimeout(
                        function () { fulfillmentInventoryRequest(NextToken) }, 180000);
                }
                //TODO: chain the following event using a Promise:
                setTimeout(removeDuplicates, 360000);
                return;
            });
    };
    function removeDuplicates() {

        const query = connection.query(`
        DELETE t1 FROM inventory_supply t1
                INNER JOIN
                inventory_supply
                t2 
        WHERE
            t2.id > t1.id AND t1.sellerSKU = t2.sellerSKU;
            
        `, (err, results) => {
if(err){
    console.log(err);
}
        });
    };
}


module.exports = inventory;