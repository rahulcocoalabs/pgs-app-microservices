const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const Razorpay = require('razorpay')
const Setting = require('../models/setting.model');
const constants = require('../helpers/constants');


async function getSettingData()  {

  var keyId = await Setting.findOne({
    key: constants.RAZORPAY_KEY_ID,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting sendgrid data',
        error: err
      }
    })
  if (keyId && (keyId.success !== undefined) && (keyId.success === 0)) {
    return res.send(keyId);
  }

  var keySecret = await Setting.findOne({
    key: constants.RAZORPAY_KEY_SECRET,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting sendgrid data',
        error: err
      }
    })
  if (keySecret && (keySecret.success !== undefined) && (keySecret.success === 0)) {
    return res.send(keySecret);
  }

  return {
    key: keyId.value,
    secret: keySecret.value
  }


}
exports.getCredentials = async (req, res) => {

  let object = await getSettingData();
  const instance = new Razorpay({
    key_id: object.key,
    key_secret: object.secret,
  });
  try {
    const options = {
      amount: 10 * 100, // amount == Rs 10
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 0,
      // 1 for automatic capture // 0 for manual capture
    };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
      return res.status(200).json(order);
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

exports.updatePayment= async (req, res) => {

  let object = getSettingData();
  let paymentId = req.params.id;
  try {
    return request(
     {
     method: "POST",
     url: `https://${object.key}:${config.object.secret}@api.razorpay.com/v1/payments/${paymentId}/capture`,
     form: {
        amount: 10 * 100, // amount == Rs 10 // Same As Order amount
        currency: "INR",
      },
    },
   async function (err, response, body) {
     if (err) {
      return res.status(500).json({
         message: "Something Went Wrong",
       }); 
     }
      console.log("Status:", response.statusCode);
      console.log("Headers:", JSON.stringify(response.headers));
      console.log("Response:", body);
      return res.status(200).json(body);
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
   });
  }
}