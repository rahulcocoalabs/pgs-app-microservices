module.exports = function Order(sequelize) {
  var Sequelize = sequelize.constructor;
  var ret =
    sequelize.define('Order', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      invoice_no: {
        type: Sequelize.INTEGER
      },
      invoice_prefix: {
        type: Sequelize.STRING
      },
      store_id: {
        type: Sequelize.INTEGER
      },
      store_name: {
        type: Sequelize.STRING
      },
      store_url: {
        type: Sequelize.STRING
      },
      customer_id: {
        type: Sequelize.INTEGER
      },
      customer_group_id: {
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      telephone: {
        type: Sequelize.STRING
      },
      fax: {
        type: Sequelize.STRING
      },
      custom_field: {
        type: Sequelize.TEXT
      },
      payment_firstname: {
        type: Sequelize.STRING
      },
      payment_lastname: {
        type: Sequelize.STRING
      },
      payment_company: {
        type: Sequelize.STRING
      },
      payment_address_1: {
        type: Sequelize.STRING
      },
      payment_address_2: {
        type: Sequelize.STRING
      },
      payment_city: {
        type: Sequelize.STRING
      },
      payment_postcode: {
        type: Sequelize.STRING
      },
      payment_country: {
        type: Sequelize.STRING
      },
      payment_country_id: {
        type: Sequelize.INTEGER
      },
      payment_zone: {
        type: Sequelize.STRING
      },
      payment_zone_id: {
        type: Sequelize.INTEGER
      },
      payment_address_format: {
        type: Sequelize.TEXT
      },
      payment_custom_field: {
        type: Sequelize.TEXT
      },
      payment_method: {
        type: Sequelize.STRING
      },
      payment_code: {
        type: Sequelize.STRING
      },
      shipping_address_id:{
        type: Sequelize.INTEGER
      },
      shipping_firstname: {
        type: Sequelize.STRING
      },
      shipping_lastname: {
        type: Sequelize.STRING
      },
      shipping_company: {
        type: Sequelize.STRING
      },
      shipping_address_1: {
        type: Sequelize.STRING
      },
      shipping_address_2: {
        type: Sequelize.STRING
      },
      shipping_city: {
        type: Sequelize.STRING
      },
      shipping_postcode: {
        type: Sequelize.STRING
      },
      shipping_country: {
        type: Sequelize.STRING
      },
      shipping_country_id: {
        type: Sequelize.INTEGER
      },
      shipping_zone: {
        type: Sequelize.STRING
      },
      shipping_zone_id: {
        type: Sequelize.INTEGER
      },
      shipping_address_format: {
        type: Sequelize.TEXT
      },
      shipping_custom_field: {
        type: Sequelize.TEXT
      },
      shipping_method: {
        type: Sequelize.STRING
      },
      shipping_code: {
        type: Sequelize.STRING
      },
      comment: {
        type: Sequelize.TEXT
      },
      total: {
        type: Sequelize.INTEGER
      },
      order_status_id: {
        type: Sequelize.INTEGER
      },
      affiliate_id: {
        type: Sequelize.INTEGER
      },
      commission: {
        type: Sequelize.INTEGER
      },
      marketing_id: {
        type: Sequelize.INTEGER
      },
      tracking: {
        type: Sequelize.STRING
      },
      language_id: {
        type: Sequelize.INTEGER
      },
      currency_id: {
        type: Sequelize.INTEGER
      },
      currency_code: {
        type: Sequelize.STRING
      },
      currency_value: {
        type: Sequelize.INTEGER
      },
      ip: {
        type: Sequelize.STRING
      },
      forwarded_ip: {
        type: Sequelize.STRING
      },
      user_agent: {
        type: Sequelize.STRING
      },
      accept_language: {
        type: Sequelize.STRING
      },
      date_added: {
        type: Sequelize.INTEGER
      },
      date_modified: {
        type: Sequelize.INTEGER
      }


    }, {
      tableName: 'oc_order',
      timestamps: false

    });


  return ret;
}
