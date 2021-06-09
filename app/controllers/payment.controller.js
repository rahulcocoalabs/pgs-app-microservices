const express = require("express");
const cors = require("cors");
const axios = require('axios');
const app = express();
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
app.use(cors());
const Razorpay = require('razorpay')
const Setting = require('../models/setting.model');
const constants = require('../helpers/constants');
const Payment = require('../models/payment.model');
const classRequest = require('../models/onlineClassRequests.model');
const Instituion = require('../models/institute.model');
const User = require('../models/user.model');
const onlineClass = require('../models/onlineClass.model');
const Packages = require('../models/packages.model');
const subject = require('../models/tutorSubject.model');
const currency = require('../models/currency.model');

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
async function getSettingDataBusiness() {

  var keyId = await Setting.findOne({
    key: "RAZORPAY_KEY_ID_BUSSINES_TEST",
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
    key: "RAZORPAY_KEY_SECRET_BUSSINES_TEST",
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

exports.getCredentialsBusiness = async (req, res) => {

  let object = await getSettingDataBusiness();
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

  console.log(req.identity);

  var userData = req.identity.data;
  var userId = userData.userId;
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
    paymentType: type,
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

  if (params.institution) {
    let result3 = await manageSubscriptions(req);

    if (result3 === true) {
      return res.status(200).send({
        success: 1, message: "Success"
      })
    }
    else {
      return res.status(200).send({
        success: 0, message: "failed"
      })
    }
  }

  if (params.classId && params.isPublic == true) {

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
    obj.isPublic = true;
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
    const owner = params.tutorId;

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
      title: " Booking for your class",
      message: "some one has booked to your class",
      type: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TYPE,
      filtersJsonArr,
      // metaInfo,
      //typeId: event._id,
      userId: owner,
      notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)

    if (saveData && saveData.success && saveData.success == 0) {
      return res.send(saveData)
    }
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

    const userInfo = await User.findOne({ status: 1, _id: userId }).catch(err => {
      return { success: 0, err: err.message }
    })
    if (userInfo && userInfo.success && userInfo.success == 0) {
      return res.send(userInfo)
    }
    const studentName = userInfo.firstName;
    const classInfo = await onlineClass.findOne({ status: 1, _id: params.classId }).catch(err => {
      return { success: 0, err: err.message }
    })
    if (classInfo && classInfo.success && classInfo.success == 0) {
      return res.send(classInfo)
    }

    const currencyInfo = await currency.findOne({ status: 1, _id: classInfo.currencyId }).catch(err => {
      return { success: 0, err: err.message }
    })
    if (currencyInfo && currencyInfo.success && currencyInfo.success == 0) {
      return res.send(currencyInfo)
    };

    const subjectInfo = await subject.findOne({ status: 1, _id: classInfo.tutorSubjectId }).catch(err => {
      return { success: 0, err: err.message }
    })
    if (subjectInfo && subjectInfo.success && subjectInfo.success == 0) {
      return res.send(subjectInfo)
    };


    const notify1 = await sendNotification(params.tutorId, studentName, amount, subjectInfo.name, currencyInfo.name, params.classId)
    const notify2 = await sendNotificationStudent(userId, amount, subjectInfo.name, currencyInfo.name, classId)
  }

  res.status(200).send({
    success: 1,
    message: 'Payment successfully added'
  })

}

async function sendNotification(tutorId, studentName, amount, subject, currency, classId) {

  var notificationMessage = studentName + " paid " + amount + " " + currency + " for your " + subject + " class";
  var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": tutorId }]
  // var metaInfo = {"type":"event","reference_id":eventData.id}
  var notificationObj1 = {
    title: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TITLE,
    message: notificationMessage,
    type: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TYPE,
    referenceId: classId,
    filtersJsonArr,
    // metaInfo,

    userId: tutorId,
    notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
  }
  let notificationData1 = await pushNotificationHelper.sendNotification(notificationObj1)

}

async function sendNotificationStudent(studentId, amount, subject, currency, classId) {

  var notificationMessage = currency + " " + amount + " paid successfully for " + subject + " class";
  console.log(" ------------------- >                       message   <--------------------------")
  console.log(notificationMessage, '24/05');
  var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": studentId }]
  // var metaInfo = {"type":"event","reference_id":eventData.id}
  var notificationObj2 = {
    title: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TITLE,
    message: notificationMessage,
    type: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TYPE,
    referenceId: classId,
    filtersJsonArr,
    // metaInfo,

    userId: studentId,
    notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
  }
  let notificationData2 = await pushNotificationHelper.sendNotification(notificationObj2)

}

exports.getPackage = async (req, res) => {

  const packagesList = await Packages.find({ status: 1 }).catch(err => {
    return { success: 0, err: err.message }
  })
  if (packagesList && packagesList.success && packagesList.success == 0) {
    return res.send(packagesList)
  }
  return res.send({ success: 1, items: packagesList })
}

async function manageSubscriptions(req) {

  const userData = req.identity.data;
  const userId = userData.userId;

  const body = req.body;

  var errors = [];
  if (!body.institution) {
    errors.push({
      filed: 'institution',
      message: 'institution not provided'
    })
  }
  if (!body.duration) {
    errors.push({
      filed: 'duration',
      message: 'duration not provided'
    })
  }

  if (errors.length > 0) {

    return false;
  }

  const interval = body.duration * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const toDate = interval + now;

  const id = body.institution;

  const updateInfo = await Instituion.updateOne({ _id: id }, { toDate: toDate, duration: body.duration, amount: body.amount }).catch(err => {

    return { success: 0, err: err.message };
  });

  if (updateInfo && updateInfo.success != undefined && updateInfo.success === 0) {

    return false;
  }
  return true;
}

