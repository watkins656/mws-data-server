module.exports = function (sequelize, DataTypes) {
  var SupplierOrder = sequelize.define("SupplierOrder", {
    OrderID: DataTypes.STRING,
    FBAShipmentID: DataTypes.STRING,
    SupplierOrderDate: DataTypes.DATEONLY,
    MerchantRecievedDate: DataTypes.DATEONLY,
    MerchantShippedDate: DataTypes.DATEONLY,
    FBARecievedDate: DataTypes.DATEONLY,
    Notes: DataTypes.STRING,
  });
  return SupplierOrder;
};
