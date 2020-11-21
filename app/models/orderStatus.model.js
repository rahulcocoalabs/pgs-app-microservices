module.exports = function OrderStatus(sequelize) {
    var Sequelize = sequelize.constructor;
    var ret =
      sequelize.define('OrderStatus', {
        order_status_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        language_id: {
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
  
      }, {
        tableName: 'oc_order_status',
        timestamps: false
  
      });
  
  
    return ret;
  }