module.exports = function StockStatus(sequelize) {
    var Sequelize = sequelize.constructor;
    var ret =
      sequelize.define('StockStatus', {
        stock_status_id: {
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
        tableName: 'oc_stock_status',
        timestamps: false
  
      });
  
  
    return ret;
  }