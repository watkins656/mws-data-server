const db = require("../models");

const order = db.SupplierOrder;
const post = db.ThreadPost;

module.exports = {


  showAllOrders: function (req, res) {
    order
      .findAll({})
      .then(dbOrder => res.json(dbOrder))
      .catch(err => console.log(err));
  },

  createOrder: function (req, res) {
    console.log(req.body);
    order.create({
      OrderID: req.body.OrderID,
      FBAShipmentID: req.body.FBAShipmentID,
      SupplierOrderDate: req.body.SupplierOrderDate,
      MerchantRecievedDate: req.body.MerchantRecievedDate,
      MerchantShippedDate: req.body.MerchantShippedDate,
      FBARecievedDate: req.body.FBARecievedDate
    }).then(function (dbOrder) {
      // We have access to the new todo as an argument inside of the callback function
      res.json(dbOrder);
    });
  },

  deleteOrder: function (req, res) {
    console.log("delete");
    order
      .destroy({
        where: {
          id: req.params.id
        }
      })
      .then(dbOrder => res.json(dbOrder))
      .catch(err => console.log(err));
  },

  editOrder: function (req, res) {
    order
      .update({
        OrderID: req.body.OrderID,
        FBAShipmentID: req.body.FBAShipmentID,
        SupplierOrderDate: req.body.SupplierOrderDate,
        MerchantRecievedDate: req.body.MerchantRecievedDate,
        MerchantShippedDate: req.body.MerchantShippedDate,
        FBARecievedDate: req.body.FBARecievedDate
      }, 
      { where: { id: req.params.id } })
      .then(dbOrder => res.json(dbOrder))
      .catch(err => console.log(err));
  },
  getSingleOrder: function (req, res) {
    order
      .findAll({
        where:{
          id:req.params.id}
        })
      .then(dbOrder => res.json(dbOrder))
      .catch(err => console.log(err));
  }
};
