module.exports = function ProductDescription(sequelize) {
    var Sequelize = sequelize.constructor;
    var ret = 
      sequelize.define('ProductDescription', {
        product_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING
        },
        description: {
          type: Sequelize.TEXT
        },
  
      }, {
        tableName: 'oc_product_decription',
        timestamps: false
  
      });
  
  
    return ret;
  }