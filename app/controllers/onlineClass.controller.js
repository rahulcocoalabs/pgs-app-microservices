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
var gateway = require('../components/gateway.component.js');

var moment = require('moment');
ObjectId = require('mongodb').ObjectID;
var charitiesConfig = config.charities;
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');
const Feed = require('../models/feed.model.js');
const sgMail = require('@sendgrid/mail');

var bcrypt = require('bcryptjs');
const { users } = require('../../config/app.config.js');
const { find } = require('../models/otp.model.js');
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
  var file = req.file;

  if (!file || !params.tutorSubjectId || !params.tutorClassId || !params.classDescription || params.isPaid === undefined
    || (params.isPaid === true && !params.fee) || !params.availableDays || !params.availableTime
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
        field: "file",
        message: "Please seect a class image"
      })
    }
    if (!req.body.tutorClassId) {
      errors.push({
        field: "tutorClassId",
        message: "tutorClassId cannot be empty"
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
    if (params.isPaid === true && !params.fee) {
      errors.push({
        field: "fee",
        message: "fee cannot be empty"
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
  onlineClassObj.isPopular = false;
  if (params.isPaid) {
    onlineClassObj.fee = params.fee;
  } else {
    onlineClassObj.fee = null;
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
    return res.send({
      success: 1,
      item: classDetails,
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

exports.getStudentHome = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var findCriteria = {};
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
  findCriteria.isPopular = true;
  findCriteria.isTutor = true;
  findCriteria.status = 1;

  var listPopularTutorData = await listTutors(findCriteria, params.perPage, params.page)
  if (listPopularTutorData && (listPopularTutorData.success !== undefined) && (listPopularTutorData.success === 0)) {
    return res.send(listPopularTutorData);
  }

  perPage = classConfig.latestInHomeResultsPerPage;

  findCriteria = {};
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

exports.getTutorDetails = async(req,res) =>{
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
if(tutorDetails){
  return res.send({
    success: 1,
    item: tutorDetails,
    tutorVideoBase: tutorConfig.videoBase,
    tutorImageBase: usersConfig.imageBase,
    message: 'Tutor details'
  })
}else{
  return res.send({
    success: 0,
    message: "Tutor not exists"
  })
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