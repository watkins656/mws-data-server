const router = require('express').Router();
const supplierOrderController = require('../../controllers/supplierOrdersController');

router.route('/get/all').get(supplierOrderController.showAllOrders);
router.route('/create').post(supplierOrderController.createOrder);
router.route('/delete/:id').delete(supplierOrderController.deleteOrder);
router.route('/edit/:id').put(supplierOrderController.editOrder);
router.route('/get/:id').get(supplierOrderController.getSingleOrder);

module.exports = router;
