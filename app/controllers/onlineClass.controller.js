const Otp = require('../models/otp.model.js');
const Setting = require('../models/setting.model');
const otplib = require('otplib');
const uuidv4 = require('uuid/v4');
var config = require('../../config/app.config.js');
var smsConfig = config.sms;
const JWT_KEY = config.jwt.key;
const JWT_EXPIRY_SECONDS = config.jwt.expirySeconds;

var msg91 = require("msg91")(smsConfig.key, smsConfig.fromNo, smsConfig.route);

var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var crypto = require("crypto");

const User = require('../models/user.model');
const OnlineCLass = require('../models/onlineClass.model');
const TutorCategory = require('../models/tutorCategory.model');
const TutorCourse = require('../models/tutorCourse.model');
const TutorClass = require('../models/tutorClass.model');
const TutorSubject = require('../models/tutorSubject.model');
const AppointmentClassRequest = require('../models/appointmentClassRequest.model');
var gateway = require('../components/gateway.component.js');

var moment = require('moment');
ObjectId = require('mongodb').ObjectID;
var charitiesConfig = config.charities;
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');
const Feed = require('../models/feed.model.js');
const sgMail = require('@sendgrid/mail');

var bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

const usersConfig = config.users;
const classConfig = config.class;
const tutorConfig = config.tutors;
const karmaConfig = config.karma;

exports.createOnlineClass = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var params = req.body;
  console.log("params")
  console.log(params)
  console.log("params")
  var file = req.file;
  console.log("file")
  console.log(file)
  console.log("file")

  if (!file || !params.tutorSubjectId || !params.title || params.title === undefined || !params.tutorClassId || !params.classDescription || params.isPaid === undefined
    || (params.isPaid === 'true' && !params.fee) || !params.availableDays || !params.availableTime
    || params.isPublic === undefined
  ) {
    var errors = [];

    if (!req.body.tutorSubjectId) {
      errors.push({
        field: "tutorSubjectId",
        message: "tutorSubjectId cannot be empty"
      })
    }
    if (!file) {
      errors.push({
        field: "image",
        message: "Please select a class image"
      })
    }
    if (!req.body.tutorClassId) {
      errors.push({
        field: "tutorClassId",
        message: "tutorClassId cannot be empty"
      })
    }

    if (!params.title || params.title === undefined) {
      errors.push({
        field: "title",
        message: "title cannot be empty"
      })
    }

    if (!req.body.classDescription) {
      errors.push({
        field: "classDescription",
        message: "classDescription cannot be empty"
      })
    }
    if (params.isPaid === undefined) {
      errors.push({
        field: "isPaid",
        message: "isPaid cannot be empty"
      })
    }
    if (params.isPaid === 'true' && !params.fee) {
      errors.push({
        field: "fee",
        message: "fee cannot be empty"
      })
    }
    if (params.isPublic === undefined) {
      errors.push({
        field: "isPublic",
        message: "isPublic cannot be empty"
      })
    }
    if (!req.body.availableDays) {
      errors.push({
        field: "availableDays",
        message: "availableDays cannot be empty"
      })
    }
    if (!req.body.availableTime) {
      errors.push({
        field: "availableTime",
        message: "availableTime cannot be empty"
      })
    }

    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }

  var onlineClassObj = {};
  onlineClassObj.userId = userId;
  onlineClassObj.tutorClassId = params.tutorClassId;
  onlineClassObj.tutorSubjectId = params.tutorSubjectId;
  onlineClassObj.classDescription = params.classDescription;
  onlineClassObj.image = file.filename;
  onlineClassObj.isPaid = params.isPaid;
  onlineClassObj.title = params.title;
  onlineClassObj.isPopular = false;
  if (params.isPaid === 'true') {
    onlineClassObj.isPaid = true;
    onlineClassObj.fee = params.fee;
  } else {
    onlineClassObj.isPaid = false;
    onlineClassObj.fee = null;
  }
  if (params.isPublic === 'true') {
    onlineClassObj.isPublic = true;
  } else {
    onlineClassObj.isPublic = false;
  }
  onlineClassObj.availableDays = params.availableDays;
  onlineClassObj.availableTime = params.availableTime;
  onlineClassObj.isApproved = false;
  onlineClassObj.isRejected = false;
  onlineClassObj.status = 1;
  onlineClassObj.tsCreatedAt = Date.now();
  onlineClassObj.tsModifiedAt = null;

  var newOnlineClassObj = new OnlineCLass(onlineClassObj);
  var onlineClassResponse = await newOnlineClassObj.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving online class',
        error: err
      }
    })
  if (onlineClassResponse && (onlineClassResponse.success !== undefined) && (onlineClassResponse.success === 0)) {
    return res.send(onlineClassResponse);
  }
  return res.send({
    success: 1,
    statusCode: 200,
    message: 'Created a class..waiting for admin approval',
  })

}

exports.getClassDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var classId = req.params.id;

  var classDetails = await OnlineCLass.findOne({
    _id: classId,
    isApproved: true,
    isRejected: false,
    status: 1
  })
    .populate([{
      path: 'userId',
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get class details',
        error: err
      }
    })
  if (classDetails && (classDetails.success !== undefined) && (classDetails.success === 0)) {
    return res.send(classDetails);
  }
  if (classDetails) {

    var checkResp = await checkIfJoinLinkAvailable(classDetails, userId);
    if (checkResp && (checkResp.success !== undefined) && (checkResp.success === 0)) {
      return res.send(checkResp);
    }
    return res.send({
      success: 1,
      item: classDetails,
      joinLinkAvailable: checkResp.joinLinkAvailable,
      classImageBase: classConfig.imageBase,
      tutorImageBase: usersConfig.imageBase,
      tutorVideoBase: tutorConfig.videoBase,
      message: 'Class details'
    })

  } else {
    return res.send({
      success: 0,
      message: "Class not exists"
    })
  }
}

exports.listOnlineClasses = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var findCriteria = {};
  if (params.isPublic !== undefined && params.isPublic === 'true') {
    findCriteria.isPublic = true;
  }
  if (params.isPublic !== undefined && params.isPublic === 'false') {
    findCriteria.isPublic = false;
  }
  if (params.isPopular === 'true') {
    findCriteria.isPopular = true;
  }

  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;

  var listClassResp = await listClasses(findCriteria, params.perPage, params.page);
  return res.send(listClassResp);
}

exports.listTutorList = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var findCriteria = {};
  var params = req.query;
  if (params.isPopular === 'true') {
    findCriteria.isPopular = true;
  }
  findCriteria.isTutor = true;
  findCriteria.status = 1;


  var listTutorResp = await listTutors(findCriteria, params.perPage, params.page)
  return res.send(listTutorResp);

}


// rakesh 

exports.listClassForTutor = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var findCriteria = {};
  var params = req.query;


  findCriteria.tutorId = userId;
  findCriteria.isApproved = true;
  findCriteria.status = 1;

  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var onlineClassData = await OnlineCLass.find(findCriteria)
    .populate([ {path: 'tutorSubjectId',}, {path: 'tutorClassId',}]).limit(perPage).skip(offset).sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }

  var totalOnlineClassCount = await OnlineCLass.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding online class count',
        error: err
      }
    })
  if (totalOnlineClassCount && (totalOnlineClassCount.success !== undefined) && (totalOnlineClassCount.success === 0)) {
    return totalOnlineClassCount;
  }

  totalPages = totalOnlineClassCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalOnlineClassCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase: classConfig.imageBase,
    items: onlineClassData,
    message: 'List latest class'
  }
 

}


exports.getStudentHome = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var tabCheckData = await checkYourTab(params, userId);
  if (tabCheckData && (tabCheckData.success !== undefined) && (tabCheckData.success === 0)) {
    return res.send(tabCheckData);
  }


  var findCriteria = {};
  if (tabCheckData.isPublic || (!tabCheckData.isPublic && tabCheckData.isFavourite === null)) {
    findCriteria.isPublic = tabCheckData.isPublic
  } else if (tabCheckData.isFavourite && tabCheckData.isPublic === null) {
    // findCriteria.isFavourite = isFavourite
  }
  findCriteria.isPopular = true;
  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  var perPage = classConfig.popularInHomeResultsPerPage;
  var page = 1;

  var listPopularClassData = await listClasses(findCriteria, perPage, page);
  if (listPopularClassData && (listPopularClassData.success !== undefined) && (listPopularClassData.success === 0)) {
    return res.send(listPopularClassData);
  }

  perPage = tutorConfig.popularInHomeResultsPerPage;
  findCriteria = {};
  if (tabCheckData.isFavourite && tabCheckData.isPublic === null) {
    // findCriteria.isFavourite = isFavourite
  }
  findCriteria.isPopular = true;
  findCriteria.isTutor = true;
  findCriteria.status = 1;

  var listPopularTutorData = await listTutors(findCriteria, params.perPage, params.page)
  if (listPopularTutorData && (listPopularTutorData.success !== undefined) && (listPopularTutorData.success === 0)) {
    return res.send(listPopularTutorData);
  }

  perPage = classConfig.latestInHomeResultsPerPage;


  findCriteria = {};
  if (tabCheckData.isPublic || (!tabCheckData.isPublic && tabCheckData.isFavourite === null)) {
    findCriteria.isPublic = tabCheckData.isPublic
  } else if (tabCheckData.isFavourite && tabCheckData.isPublic === null) {
    // findCriteria.isFavourite = isFavourite
  }
  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  var listLatestClassData = await listClasses(findCriteria, perPage, page);
  if (listLatestClassData && (listLatestClassData.success !== undefined) && (listLatestClassData.success === 0)) {
    return res.send(listLatestClassData);
  }

  return res.send({
    success: 1,
    popularClasses: listPopularClassData.items,
    popularTutors: listPopularTutorData.items,
    latestClasses: listLatestClassData.items,
    classImageBase: classConfig.imageBase,
    tutorImageBase: usersConfig.imageBase,
    message: 'Student home'
  })


}

exports.getTutorDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorId = req.params.id;

  var findCriteria = {};
  findCriteria._id = tutorId;
  findCriteria.isTutor = true;
  findCriteria.status = 1;
  var tutorDetails = await User.findOne(findCriteria)
    .populate([{
      path: 'tutorCourseIds',
    }, {
      path: 'tutorSubjectIds',
    }, {
      path: 'tutorClassIds',
    }, {
      path: 'tutorCategoryIds',
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get tutor details',
        error: err
      }
    })
  if (tutorDetails && (tutorDetails.success !== undefined) && (tutorDetails.success === 0)) {
    return res.send(tutorDetails);
  }
  if (tutorDetails) {
    return res.send({
      success: 1,
      item: tutorDetails,
      tutorVideoBase: tutorConfig.videoBase,
      tutorImageBase: usersConfig.imageBase,
      message: 'Tutor details'
    })
  } else {
    return res.send({
      success: 0,
      message: "Tutor not exists"
    })
  }
}

exports.requestAppointment = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var params = req.body;

  if (!params.tutorSubjectId || !params.tutorClassId || !params.tutorId) {
    var errors = [];
    if (!params.tutorSubjectId) {
      errors.push({
        field: "tutorSubjectId",
        message: "subject id missing"
      });
    }
    if (!params.tutorClassId) {
      errors.push({
        field: "tutorClassId",
        message: "class id missing"
      });
    }
    if (!params.tutorId) {
      errors.push({
        field: "tutorId",
        message: "tutor id missing"
      });
    }
    return {
      success: 0,
      errors: errors,
      code: 200
    };
  }


  var checkAppointmentRequestResp = await checkAppointmentRequest(params, userId);
  if (checkAppointmentRequestResp && (checkAppointmentRequestResp.success !== undefined) && (checkAppointmentRequestResp.success === 0)) {
    return res.send(checkAppointmentRequestResp);
  }

  var appointmentClassRequestObj = {};

  appointmentClassRequestObj.userId = userId;
  appointmentClassRequestObj.tutorId = params.tutorId;
  appointmentClassRequestObj.tutorClassId = params.tutorClassId;
  appointmentClassRequestObj.tutorSubjectId = params.tutorSubjectId;
  appointmentClassRequestObj.isApproved = false;
  appointmentClassRequestObj.isRejected = false;
  appointmentClassRequestObj.status = 1;
  appointmentClassRequestObj.tsCreatedAt = Date.now();
  appointmentClassRequestObj.tsModifiedAt = null;

  var newAppointmentClassRequest = new AppointmentClassRequest(appointmentClassRequestObj);
  var newAppointmentClassRequestData = await newAppointmentClassRequest.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while save appointment class request',
        error: err
      }
    })
  if (newAppointmentClassRequestData && (newAppointmentClassRequestData.success !== undefined) && (newAppointmentClassRequestData.success === 0)) {
    return res.send(newAppointmentClassRequestData);
  }

  return res.send({
    success: 1,
    message: 'Appointment request sent successfully'
  })

}


exports.updateAppointmentStatus = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var params = req.body;
  var appointmentId = req.params.id;

  if (!params.status || (params.status && params.status !== constants.APPROVED_STATUS
    && params.status !== constants.REJECTED_STATUS)) {
    var errors = [];
    if (!params.status) {
      errors.push({
        'field': 'status',
        'message': 'appoinment status required',
      })
    }
    if ((params.status && params.status !== constants.APPROVED_STATUS
      && params.status !== constants.REJECTED_STATUS)) {
      errors.push({
        'field': 'status',
        'message': 'Invalid status',
      })
    }
    return res.send({
      success: 0,
      errors
    })
  }
  var isApproved = false;
  var isRejected = false;
  var message = ""
  if (params.status === constants.APPROVED_STATUS) {
    isApproved = true;
    message = 'Appointment accepted successfully'
  } else {
    message = 'Appointment rejected successfully'
    isRejected = false;
  }

  var checkAppointment = await AppointmentClassRequest.findOne({
    _id: appointmentId,
    tutorId: userId,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while check user',
        error: err
      }
    })
  if (checkAppointment && (checkAppointment.success !== undefined) && (checkAppointment.success === 0)) {
    return res.send(checkAppointment);
  }

  if (checkAppointment && checkAppointment !== null) {
    var checkAppointmentResp = await checkAppointmentStatusCheck(checkAppointment, isApproved, isRejected)
    if (checkAppointmentResp && (checkAppointmentResp.success !== undefined) && (checkAppointmentResp.success === 0)) {
      return res.send(checkAppointmentResp);
    }

    var updateAppointmentStatus = await AppointmentClassRequest.updateOne({
      _id: appointmentId,
      tutorId: userId,
      status: 1
    }, checkAppointmentResp.update)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while check user',
          error: err
        }
      })
    if (updateAppointmentStatus && (updateAppointmentStatus.success !== undefined) && (updateAppointmentStatus.success === 0)) {
      return res.send(updateAppointmentStatus);
    }
    return res.send({
      success: 1,
      message
    })
  } else {
    return res.send({
      success: 0,
      message: 'Appoinment request not exists',
    });
  }

}


async function checkUserIsTutor(userId) {
  var userData = await User.findOne({
    _id: userId,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking user is a tutor',
        error: err
      }
    })
  if (userData && (userData.success !== undefined) && (userData.success === 0)) {
    return userData;
  }
  if (userData) {
    if (userData.isTutor) {
      return {
        success: 1,
        message: 'User is a tutor',
      }
    } else {
      return {
        success: 0,
        message: 'You are not a tutor',
      }
    }
  } else {
    return {
      success: 0,
      message: 'User not exists',
    }
  }
}

async function listClasses(findCriteria, perPage, page) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var onlineClassData = await OnlineCLass.find(findCriteria)
    .populate([{
      path: 'userId',
      select: {
        firstName: 1
      }
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }

  var totalOnlineClassCount = await OnlineCLass.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding online class count',
        error: err
      }
    })
  if (totalOnlineClassCount && (totalOnlineClassCount.success !== undefined) && (totalOnlineClassCount.success === 0)) {
    return totalOnlineClassCount;
  }

  totalPages = totalOnlineClassCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalOnlineClassCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase: classConfig.imageBase,
    items: onlineClassData,
    message: 'List latest class'
  }
}


async function listTutors(findCriteria, perPage, page) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || tutorConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : tutorConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var tutorsData = await User.find(findCriteria)
    .populate([{
      path: 'tutorCourseIds'
    }, {
      path: 'tutorSubjectIds'
    }, {
      path: 'tutorClassIds'
    }, {
      path: 'tutorCategoryIds'
    }])
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting tutors',
        error: err
      }
    })
  if (tutorsData && (tutorsData.success !== undefined) && (tutorsData.success === 0)) {
    return tutorsData;
  }

  var totalTutorsCount = await User.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding total tutors count',
        error: err
      }
    })
  if (totalTutorsCount && (totalTutorsCount.success !== undefined) && (totalTutorsCount.success === 0)) {
    return totalTutorsCount;
  }

  totalPages = totalTutorsCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalTutorsCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase: users.imageBase,
    items: tutorsData,
    message: 'List tutors'
  }

}

async function checkAppointmentRequest(params, userId) {
  var checkAppountmentData = await AppointmentClassRequest.findOne({
    userId,
    tutorId: params.tutorId,
    classId: params.classId,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while save appointment class request',
        error: err
      }
    })
  if (checkAppountmentData && (checkAppountmentData.success !== undefined) && (checkAppountmentData.success === 0)) {
    return checkAppountmentData;
  }
  if (checkAppountmentData) {
    if (!checkAppountmentData.isApproved && !checkAppountmentData.isRejected) {
      return {
        success: 0,
        message: 'Already sent an appointment request'
      }
    } else if (checkAppountmentData.isApproved) {
      return {
        success: 0,
        message: 'Already sent an appointment request and your request already apporoved'
      }
    } else {
      return {
        success: 1,
        message: 'Your old appontment request rejected'
      }
    }

  } else {
    return {
      success: 1,
      message: 'New appoinment request'
    }
  }
}


async function checkYourTab(params, userId) {
  if (!params.tabType) {
    return {
      success: 0,
      message: "Tab type required"
    }
  }
  if (params.tabType !== constants.PUBLIC_TAB
    && params.tabType !== constants.PRIVATE_TAB
    && params.tabType !== constants.FAVOURITES_TAB
    && params.tabType !== constants.OFFLINE_TAB) {
    return {
      success: 0,
      message: "Invalid tab"
    }
  }

  if (params.tabType === constants.PUBLIC_TAB) {
    console.log("inside public");
    return {
      success: 1,
      isPublic: true,
      isFavourite: null,
      message: 'Public tab'
    }
  } else if (params.tabType === constants.PRIVATE_TAB) {
    return {
      success: 1,
      isPublic: false,
      isFavourite: null,
      message: 'Private tab'
    }
  } else if (params.tabType === constants.FAVOURITES_TAB) {
    return {
      success: 1,
      isFavourite: true,
      isPublic: null,
      message: 'Favourites tab'
    }
  } else {
    return {
      success: 1,
      isFavourite: null,
      isPublic: null,
      message: 'Offline tab'
    }
  }
}


async function checkClassIsPrivate(params) {
  var onlineClassData = await OnlineCLass.findOne({
    _id: params.tutorClassId,
    _id: params.tutorClassId,
    isPublic: false,
    isApproved: true,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking private class',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }
  console.log("onlineClassData")
  console.log(onlineClassData)
  console.log("onlineClassData")
  if (onlineClassData && onlineClassData !== null) {
    return {
      success: 1,
      message: 'Private class',
    }
  } else {
    return {
      success: 0,
      message: 'Invalid private class',
    }
  }
}



async function checkAppointmentStatusCheck(appointmentData, isApproved, isRejected) {
  if (appointmentData.isApproved && isApproved) {
    return {
      success: 0,
      message: 'Appoinment request already approved',
    };
  } else if (appointmentData.isRejected && isRejected) {
    return {
      success: 0,
      message: 'Appoinment request already rejected',
    };
  }
  var updateObj = {};
  if (isApproved) {
    var findCriteria = {};
    findCriteria.tutorSubjectId = appointmentData.tutorSubjectId;
    findCriteria.tutorClassId = appointmentData.tutorClassId;
    findCriteria.isPublic = false;
    findCriteria.isApproved = true;
    findCriteria.isRejected = false;
    findCriteria.status = 1;

    var checkOnlineClass = await OnlineCLass.findOne(findCriteria)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking user is a tutor',
          error: err
        }
      })
    if (checkOnlineClass && (checkOnlineClass.success !== undefined) && (userData.success === 0)) {
      return checkOnlineClass;
    }
    if (!checkOnlineClass || checkOnlineClass === null) {
      return {
        success: 0,
        message: 'Requested online class not added, So add class',
      };
    } else {
      updateObj.isApproved = true;
      updateObj.tsModifiedAt = Date.now();

      return {
        success: 1,
        message: 'Approve status',
        update: updateObj
      }
    }
  } else {
    updateObj.isRejected = true;
    updateObj.tsModifiedAt = Date.now();
    return {
      success: 1,
      message: 'Reject status',
      update: updateObj
    }
  }
}


async function checkIfJoinLinkAvailable(classDetails, userId) {
  if (classDetails.isPublic) {
    return {
      success: 1,
      joinLinkAvailable: true,
      message: 'Public class'
    }
  } else {
    var appointmentCheckResp = await AppointmentClassRequest.findOne({
      userId,
      tutorId: classDetails.userId,
      tutorSubjectId: classDetails.tutorSubjectId,
      tutorClassId: classDetails.tutorClassId,
      isApproved: true,
      isRejected: false,
      status: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking appointment request approve or not',
          error: err
        }
      })
    if (appointmentCheckResp && (appointmentCheckResp.success !== undefined) && (appointmentCheckResp.success === 0)) {
      return appointmentCheckResp;
    }
    if (appointmentCheckResp && appointmentCheckResp !== null) {
      return {
        success: 1,
        joinLinkAvailable: true,
        message: 'Private class with approved appointment request'
      }

    } else {
      return {
        success: 1,
        joinLinkAvailable: false,
        message: 'Private class not approve appointment or not sent request'
      }
    }
  }
}