module.exports = function OrderProduct(sequelize) {
  var Sequelize = sequelize.constructor;
  var ret =
    sequelize.define('OrderProduct', {
      order_product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER
      },
      master_id: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      model: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.DECIMAL
      },
      total: {
        type: Sequelize.DECIMAL
      },
      tax: {
        type: Sequelize.DECIMAL
      },
      reward: {
        type: Sequelize.INTEGER
      },
      order_status_id: {
        type: Sequelize.INTEGER
      },
      address_id: {
        type: Sequelize.INTEGER
      }

    }, {
      tableName: 'oc_order_product',
      timestamps: false

    });


  return ret;
}
