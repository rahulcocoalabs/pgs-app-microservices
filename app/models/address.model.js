module.exports = function Address(sequelize) {
  var Sequelize = sequelize.constructor;
  var ret =
    sequelize.define('Address', {
      address_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.STRING
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      address_1: {
        type: Sequelize.STRING
      },
      address_2: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      postcode: {
        type: Sequelize.STRING
      },
      country_id: {
        type: Sequelize.STRING
      },
      state_id: {
        type: Sequelize.STRING
      },
      city_id: {
        type: Sequelize.STRING
      },
      zone_id: {
        type: Sequelize.INTEGER
      },
      mobile: {
        type: Sequelize.STRING
      },
      landmark: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      }

    }, {
      tableName: 'oc_address',
      timestamps: false

    });


  return ret;
}
