module.exports = function Product(sequelize) {
  var Sequelize = sequelize.constructor;
  var ret =
    sequelize.define('Product', {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      master_id: {
        type: Sequelize.INTEGER
      },
      model: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      stock_status_id: {
        type: Sequelize.INTEGER
      },
      date_added: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.INTEGER
      }

    }, {
      tableName: 'oc_product',
      timestamps: false

    });
  return ret;

}
