module.exports = function AlumniAdmin(sequelize) {
    var Sequelize = sequelize.constructor;
    var ret =
      sequelize.define('AlumniAdmin', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING
        },
        username: {
          type: Sequelize.STRING
        },
        password_hash: {
          type: Sequelize.STRING
        },
        mongoId: {
            type: Sequelize.STRING
        },
        status: {
            ttype: Sequelize.NUMBER
        }
      }, {
        tableName: 'user',
        timestamps: false
  
      });
  
  
    return ret;
  }
  