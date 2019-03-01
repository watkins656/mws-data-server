const router = require('express').Router();
const supplierOrders = require('./supplierOrders');


router.use('/supplierOrders', supplierOrders);
module.exports = router;
