const connection = require('../../config/connection')

const inventoryHealth = {

    updateInventoryHealthTable: function (report) {
        return new Promise(function (resolve, reject) {

            async function processItems(report) {
                for (const item of report) {
                    await inventoryHealth.insertItem(item);
                }
                console.log("done...");
                resolve("Done!");
            };
            processItems(report);
        });
    },
    insertItem: async function (item) {
        const queryString = "INSERT INTO InventoryHealths SET ?";
        await connection.query(queryString, item, (err, res) => {
            if (res.changedRows) { console.log(res.changedRows + " order inserted!\n"); }
        })
    },
    removeDuplicates: function () {
        const removeDuplicates = `DELETE t1 FROM InventoryHealths t1 INNER JOIN InventoryHealths t2 WHERE t2.id > t1.id AND t1.sku = t2.sku;`
        connection.query(removeDuplicates, (err, res) => {
            if (err)
                console.log(err);
            else
                if (res.changedRows) console.log(`Updated ${res.changedRows} items in Inventory Health!`);
        })
    },
    stockoutCorrection: function () {
        const max = "SELECT MAX(`snapshot-date`)as date FROM InventoryHealths";
        let currDate;
        connection.query(max, (err, res) => {
            if (err)
                console.log(err);
            else
                currDate = (res[0].date);
            const all = "SELECT * FROM InventoryHealths where `snapshot-date`<'" + currDate + "';"
            connection.query(all, (err, res) => {
                if (err)
                    console.log(err);
                else
                    console.log(res.length);
                res.forEach(sku => {

                    const update = "UPDATE InventoryHealths SET ? WHERE ?"
                    const set = {
                        "snapshot-date": currDate,
                        "total-quantity": 0,
                        "sellable-quantity": 0,
                        "unsellable-quantity": 0,
                        "inv-age-0-to-90-days": 0,
                        "inv-age-91-to-180-days": 0,
                        "inv-age-181-to-270-days": 0,
                        "inv-age-271-to-365-days": 0,
                        "inv-age-365-plus-days": 0
                    }

                    let where = { id: sku.id }
                    connection.query(update,set,where, (err, res) => {
                        if (err)
                            console.log(err);
                        else
                            console.log(res);
                    });
                })
            })
        })
    }
}



module.exports = inventoryHealth;
