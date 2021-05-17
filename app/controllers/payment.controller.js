const express = require("express");
const cors = require("cors");
const axios = require('axios');
const app = express();
app.use(cors());
const Razorpay = require('razorpay')
const Setting = require('../models/setting.model');
const constants = require('../helpers/constants');
const Payment = require('../models/payment.model');
const classRequest = require('../models/onlineClassRequests.model');

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
        console.log(err, err.message)
        return res.status(500).json({
          message: "Something Went Wrong",
          error: err.message
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
      error: err.message
    });
  }
};

exports.updatePayment = async (req, res) => {

  let object = getSettingData();
  let paymentId = req.params.id;
  let amount = req.body.amount;
  try {
    return request(
      {
        method: "POST",
        url: `https://rzp_test_0eNdXM0OQ3OMf0:8P2s0RUm6DWeErPG3H7vXoWa@api.razorpay.com/v1/payments/${paymentId}/capture`,
        form: {
          amount: amount * 100, // amount == Rs 10 // Same As Order amount
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

exports.savePayment = async (req, res) => {

  var identity = req.identity.data;
  var userId = identity.userId;
  var params = req.body;

  var transactionId = params.transactionId;
  var amount = params.amount;
  var paidStatus = params.paidStatus;
  var paidOn = params.paidOn;
  var charityId = params.charityId;
  var classId = params.classId;
  var paymentStatus = params.paymentStatus;
  var message = params.message;
  var type = params.paymentType;

  const newPayment = new Payment({
    userId: userId,
    charityId: charityId,
    classId: classId,
    transactionId: transactionId,
    amount: amount,
    paymentStatus: paymentStatus,
    message: message,
    paymentType:type,
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

  if (params.classId && params.isPublic == false) {
    var obj = {}
    const monthNames = ["01", "02", "03", "04", "05", "06",
      "07", "08", "09", "10", "11", "12"];
    const dateObj = new Date();
    const month = monthNames[dateObj.getMonth()];
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const output = day + ":" + month + ':' + year;
    obj.tutorId = params.tutorId;
    obj.classId = params.classId;
    obj.status = 1;
    obj.isApproved = false;
    obj.isRejected = false;
    obj.tsCreatedAt = Date.now();
    obj.created = output;
    obj.tsModifiedAt = null;
    obj.userId = userId;
    obj.isPaid = true;

    var request = new classRequest(obj);

    var saveData = await request.save().catch(err => {
      return { success: 0, err: err.message }
    });

    if (saveData && saveData.success && saveData.success == 0) {
      return res.send(saveData)
    }
  }

  res.status(200).send({
    success: 1,
    message: 'Payment successfully added'
  })

}

