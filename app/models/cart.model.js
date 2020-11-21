module.exports = function Cart(sequelize) {
  var product = require('./product.model.js')(sequelize);
  var Sequelize = sequelize.constructor;
  var ret =
    sequelize.define('Cart', {
      cart_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.STRING
      },
      productId: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      date_added: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      }

    }, {
      tableName: 'oc_cart',
      timestamps: false

    });
  ret.relations = {
    product: product,
  };
  ret.belongsTo(product, {
    foreignKey: 'productId'
  });
  return ret;
}
