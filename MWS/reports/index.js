const reportList = require("./reportList");
const getReport = require("./getReport");
const inventoryHealth = require("./inventoryHealth");


//See Bottom for list of Reports
reportList.reportRequestByType("_GET_FBA_FULFILLMENT_INVENTORY_HEALTH_DATA_").then(function (report) {
    getReport.reportRequest(report.ReportId).then(function (report) {
        inventoryHealth.updateInventoryHealthTable(report).then(function (response) {

            inventoryHealth.removeDuplicates();
            inventoryHealth.stockoutCorrection(); //TODO: Chain this behind removeDuplicates() with a promise
        })
    })
});
