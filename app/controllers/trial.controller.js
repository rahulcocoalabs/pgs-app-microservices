const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const Razorpay = require('razorpay')
const Setting = require('../models/setting.model');
const constants = require('../helpers/constants');
const Payment = require('../models/payment.model');
const onlineClass = require('../models/user.model');


async function getSettingData() {

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
exports.getKey = async (req, res) => {

  let object = await getSettingData();
  if (object === undefined) {
    return res.status(200).json({
      success: 0,
      message: "something went wrong in ftching key"
    })
  }
  let key = object.key;
  if (key === undefined) {
    return res.status(200).json({
      success: 0,
      message: "something went wrong in ftching key"
    })
  }
  return res.status(200).json({
    success: 1,
    message: "obtained key successfully",
    key: key
  })
}

exports.getCredentials = async (req, res) => {

  let data = req.identity.data;
  let userId = data.userId;
  let object = await getSettingData();
  let amount = req.query.amount;
  const instance = new Razorpay({
    key_id: object.key,
    key_secret: object.secret,
  });
  try {
    const options = {
      amount: amount * 100, // amount == Rs 10
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
      return res.status(200).json({
        success: 1,
        message: "fetched successfully credentials for payments",
        item: order
      });
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

exports.savePayment = async (req, res) => {

  var identity = req.identity.data;
  var userId = identity.id;
  var params = req.body;

  var transactionId = params.transactionId;
  var amount = params.amount;
  var paidStatus = params.paidStatus;
  var paidOn = params.paidOn;
  var charityId = params.charityId;

  const newPayment = new Payment({
    userId: userId,
    charityId:charityId,
    transactionId: transactionId,
    amount: amount,
    paidStatus: paidStatus,
    paidOn: paidOn,
    status: 1,
    tsCreatedAt: Date.now(),
    tsModifiedAt: null
  });
  var savePayment = await newPayment.save().catch(err => {
    return { success: 0, message: err.message }
  });

  if (savePayment && savePayment.success != undefined && savePayment.success === 0) {
    return res.status(200).send(savePayment);
  }

  res.status(200).send({
    success: 1,
    message: 'Payment successfully added'
  })

}

exports.softDelete = async (req,res) => {

  var email = "";
  var status = 0;

  if (req.body.email){
    email = req.body.email;
  }

  if (req.body.status){
    if (req.body.status === 1){
      status = 1;
    }
  }


  var update = await onlineClass.updateMany({email:email,status:1},{status:0}).catch(err=> {
    return res.send("failed")
  })

  return res.send("done")

}