const Otp = require('../models/otp.model.js');
const Setting = require('../models/setting.model');
const otplib = require('otplib');
const uuidv4 = require('uuid/v4');
var config = require('../../config/app.config.js');
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
var smsConfig = config.sms;
const JWT_KEY = config.jwt.key;
const JWT_EXPIRY_SECONDS = config.jwt.expirySeconds;

var msg91 = require("msg91")(smsConfig.key, smsConfig.fromNo, smsConfig.route);

var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var crypto = require("crypto");

const User = require('../models/user.model');
const OnlineCLass = require('../models/onlineClass.model');
const FavouriteClass = require('../models/instituteClassFavourite.model')
const FavouriteInstitute = require('../models/favouriteInstitutes.model');
const InstitutionClass = require('../models/instituteClass.model');
const tutorRequestModel = require('../models/requestForTutor.model');
const classRequest = require('../models/onlineClassRequests.model');
const Instituion = require('../models/institute.model');
const TutorCategory = require('../models/tutorCategory.model');
const TutorCourse = require('../models/tutorCourse.model');
const TutorClass = require('../models/tutorClass.model');
const TutorSubject = require('../models/tutorSubject.model');
const AppointmentClassRequest = require('../models/appointmentClassRequest.model');

const InstituteClassAppointmentRequest = require('../models/instituteClassAppointment.model');
const Currency = require('../models/currency.model');
const TutorSyllabus = require('../models/tutorSyllabus.model');
const PushNotification = require('../models/pushNotification.model');
var gateway = require('../components/gateway.component.js');

var moment = require('moment');
ObjectId = require('mongodb').ObjectID;
var charitiesConfig = config.charities;
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');
const Feed = require('../models/feed.model.js');
const sgMail = require('@sendgrid/mail');

var bcrypt = require('bcryptjs');
const tutorSubjectModel = require('../models/tutorSubject.model');


const salt = bcrypt.genSaltSync(10);

const usersConfig = config.users;
const classConfig = config.class;
const tutorConfig = config.tutors;
const appointmentConfig = config.appointment;
const karmaConfig = config.karma;

exports.createOnlineClass = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var params = req.body;

  var file = req.files;




  // if (!file || !(params.tutorSubjectId || params.tutorSubject) || !params.title || params.title === undefined || !(params.tutorClassId || params.tutorClass) || !params.classDescription || params.isPaid === undefined
  //   || (params.isPaid === 'true' && !params.fee) || !params.availableDays 
  //   || params.isPublic === undefined || (params.isPaid === 'true' && !params.classTimeCategory)
  //   || (params.isPaid === 'true' && !params.currencyId) || !(params.tutorSyllabusId || params.tutorSyllabus) || params.availableFromTime || 
  //   params.availableToTime ) {
  var errors = [];

  //console.log("parameters => ", params)

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
  if (!req.body.availableFromTime) {
    errors.push({
      field: "availableFromTime",
      message: "starting time cannot be empty"
    })
  }
  if (!req.body.availableToTime) {
    errors.push({
      field: "availableToTime",
      message: "end time cannot be empty"
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
  if (params.isPaid === 'true' && !params.classTimeCategory) {
    errors.push({
      field: "classTimeCategory",
      message: "classTimeCategory cannot be empty"
    })
  }
  if ((params.isPaid === 'true' && !params.currencyId)) {
    errors.push({
      field: "currencyId",
      message: "currencyId cannot be empty"
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

  if (!params.tutorSyllabusId) {
    errors.push({
      field: "tutorSyllabusId",
      message: "tutorSyllabusId cannot be empty"
    })
  }

  //console.log("errors =>", errors);


  if (errors.length > 0) {

    return res.status(200).send({
      success: 0,
      errors: errors,

      code: 200
    });
  }
  // }
  //console.log("08/12/202", file.filename)
  var onlineClassObj = {};
  onlineClassObj.userId = userId;
  onlineClassObj.tutorClassId = params.tutorClassId;
  onlineClassObj.tutorSubjectId = params.tutorSubjectId;

  var updateTutorProfile = await updateClassAndSubject(params.tutorClassId, params.tutorSubjectId, userId);

  if (updateTutorProfile == 0) {
    return res.send({
      success: 0,
      message: "could not update tutor profile"
    })
  }


  onlineClassObj.classDescription = params.classDescription;
  if (file.image && file.image.length > 0) {
    onlineClassObj.image = file.image[0].filename;
  }
  if (file.video && file.video.length > 0) {
    onlineClassObj.video = file.video[0].filename;
  }
  onlineClassObj.isPaid = params.isPaid;
  onlineClassObj.title = params.title;
  onlineClassObj.tutorSyllabusId = params.tutorSyllabusId;
  onlineClassObj.isPopular = false;
  if (params.isPaid === 'true') {
    onlineClassObj.isPaid = true;
    onlineClassObj.fee = params.fee;
    onlineClassObj.classTimeCategory = params.classTimeCategory;
    onlineClassObj.currencyId = params.currencyId;
  } else {
    onlineClassObj.isPaid = false;
    onlineClassObj.fee = null;
    onlineClassObj.classTimeCategory = null;
    onlineClassObj.currencyId = null;

  }
  if (params.isPublic === 'true') {
    onlineClassObj.isPublic = true;
  } else {
    onlineClassObj.isPublic = false;
  }

  if (params.availableDays.length == 0) {
    return res.send({
      success: 0,
      message: "select at least one day"
    })
  }

  onlineClassObj.availableDays = params.availableDays;
  onlineClassObj.availableTime = params.availableTime;
  onlineClassObj.isApproved = false;
  onlineClassObj.isRejected = false;
  onlineClassObj.status = 1;
  onlineClassObj.tsCreatedAt = Date.now();
  onlineClassObj.tsModifiedAt = null;
  //rakesh 

  var tutorName = await User.findOne({ _id: params.userId, status: 1 }, { firstName: 1 }).catch(err => {
    return { success: 0, message: err.message };
  })

  if (tutorName && (tutorName.success !== undefined) && (tutorName.success === 0)) {
    return res.send(tutorName);
  }

  onlineClassObj.tutorName = tutorName;

  onlineClassObj.tutorSubject = params.tutorSubject;
  onlineClassObj.tutorClass = params.tutorClass;
  onlineClassObj.tutorSyllabus = params.tutorSyllabus;
  onlineClassObj.qualification = params.qualification;
  onlineClassObj.category = params.category;
  onlineClassObj.availableFromTime = params.availableFromTime;
  onlineClassObj.availableToTime = params.availableToTime;

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
    filename: file.filename,
    message: 'Created a class..waiting for admin approval',
  })

}

// exports.getClassDetails = async (req, res) => {
//   var userData = req.identity.data;
//   var userId = userData.userId;
//   var params = req.query;
//   console.log("testing pm2 command");

//   var classId = req.params.id;
//   var favouriteDataResp = await getUserFavouriteData(userId);
//   if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
//     return res.send(favouriteDataResp);
//   }
//   var favouriteData = favouriteDataResp.favouriteData;
//   var classDetails = await OnlineCLass.findOne({
//     _id: classId,
//     isApproved: true,
//     isRejected: false,
//     status: 1
//   },{
//     zoomLink : 0,
//     startUrl : 0
//   })
//     .populate([{
//       path: 'userId',
//     }, {
//       path: 'tutorSubjectId',
//     }, {
//       path: 'tutorClassId',
//     }, {
//       path: 'currencyId',
//     }])
//     .catch(err => {
//       return {
//         success: 0,
//         message: 'Something went wrong while get class details',
//         error: err
//       }
//     })
//   if (classDetails && (classDetails.success !== undefined) && (classDetails.success === 0)) {
//     return res.send(classDetails);
//   }
//   console.log("classDetails")
//   console.log(classDetails)
//   console.log("classDetails")
//   if (classDetails) {
//     classDetails = JSON.parse(JSON.stringify(classDetails))
//     var checkResp = await checkIfJoinLinkAvailable(classDetails, userId);
//     if (checkResp && (checkResp.success !== undefined) && (checkResp.success === 0)) {
//       return res.send(checkResp);
//     }
//     if (favouriteData && favouriteData.favouriteClass !== null && favouriteData.favouriteClass !== undefined) {
//       var index = await favouriteData.favouriteClass.findIndex(id => JSON.stringify(id) === JSON.stringify(classId));
//       if (index > -1) {
//         classDetails.isFavourite = true;
//       } else {
//         classDetails.isFavourite = false;
//       }
//     } else {
//       classDetails.isFavourite = false;
//     }



//     return res.send({
//       success: 1,
//       debugflag:"ok",
//       item: classDetails,
//       joinLinkAvailable: checkResp.joinLinkAvailable,
//       classImageBase: classConfig.imageBase,
//       tutorImageBase: usersConfig.imageBase,
//       tutorVideoBase: tutorConfig.videoBase,
//       message: 'Class details'
//     })

//   } else {
//     return res.send({
//       success: 0,
//       message: "Class not exists"
//     })
//   }
// }


async function updateClassAndSubject(classId, subjectId, userId) {

  var returnValue = 1;



  var info = await User.findOne({ status: 1, _id: userId }, { tutorSubjectIds: 1, tutorClassIds: 1 }).catch(err => {
    return 0;
  });
  if (info == 0) {
    return info;
  }

  if (!info.tutorSubjectIds.includes(subjectId) || !info.tutorClassIds.includes(classId)) {
    if (!info.tutorSubjectIds.includes(subjectId)) {
      var update1 = { $push: { tutorSubjectIds: subjectId } }


      var updateinfo = await User.updateOne({ status: 1, _id: userId }, update1).catch(err => { return 0 })

      if (updateinfo == 0) {
        return updateinfo;
      }
      else {
        //return 1;
      }

    }
    if (!info.tutorClassIds.includes(classId)) {
      var update2 = { $push: { tutorClassIds: classId } }



      var updateinfo = await User.updateOne({ status: 1, _id: userId }, update2).catch(err => { return 0 })

      if (updateinfo == 0) {
        return updateinfo;
      }
      else {
        //return 1;
      }

    }



  }
  else {
    return 1
  }

  return returnValue;
}

exports.createTutorRequest = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.body;

  if (!params.tutorSubjectId || !params.tutorClassId || !params.classDescription) {
    var errors = [];

    if (!req.body.tutorSubjectId) {
      errors.push({
        field: "tutorSubjectId",
        message: "tutorSubjectId cannot be empty"
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


    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }
  // validating inputn data 

  var subjectCount = await tutorSubjectModel.countDocuments({ status: 1, _id: req.body.tutorSubjectId }).catch(err => {
    return { success: 0, message: "could not read document count of subjects" }
  })
  if (subjectCount && subjectCount.success && subjectCount.success === 0) {
    return res.send(subjectCount)
  }

  var classCount = await TutorClass.countDocuments({ status: 1, _id: req.body.tutorClassId }).catch(err => {
    return { success: 0, message: "could not read document count of subjects" }
  })
  if (classCount && classCount.success && classCount.success === 0) {
    return res.send(subjectCount)
  }

  if (classCount == 0) {
    return res.send({
      success: 0,
      message: "specified class is deleted or does not exist"
    })
  }
  if (subjectCount == 0) {
    return res.send({
      success: 0,
      message: "specified subject is deleted or does not exist"
    })
  }
  //end

  var requestObject = {};
  requestObject.status = 1;
  requestObject.description = 1;
  requestObject.userId = userId;
  requestObject.tsCreatedAt = Date.now();
  requestObject.tsModifiedAt = null;
  requestObject.subject = req.body.tutorSubjectId;
  requestObject.class = req.body.tutorClassId;
  var newrequestObject = new tutorRequestModel(requestObject);
  var newTutorRequestResponse = await newrequestObject.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving request',
        error: err
      }
    })
  if (newTutorRequestResponse && (newTutorRequestResponse.success !== undefined) && (newTutorRequestResponse.success === 0)) {
    return res.send(newTutorRequestResponse);
  }
  return res.send({
    success: 1,
    statusCode: 200,
    message: 'Created a request',
  })

}

exports.getZoomLink = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.params;
  var classId = params.id;
  var classDetails = await OnlineCLass.findOne({
    _id: classId,
    isApproved: true,
    isRejected: false,
    status: 1
  }).populate([{
    path: 'tutorSubjectId',
    select: '_id:1'
  }, {
    path: 'tutorClassId',
    select: '_id:1'
  }]).catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while get class details',
      error: err
    }
  })
  if (classDetails && classDetails.success && classDetails.success === 0) {
    return res.send(classDetails);
  }

  if (classDetails) {
    if (classDetails.isPublic === true) {
      return res.send({
        success: 1,
        message: "link to join class",
        link: classDetails.zoomLink
      })
    }
    else {
      var approveRequestCriteria = {
        userId,
        tutorClassId: classDetails.tutorClassId,
        tutorSubjectId: classDetails.tutorSubjectId,
        isApproved: true,
        isRejected: false,
        status: 1
      }

      var requestDetailsCount = await AppointmentClassRequest.countDocuments().catch(err => {
        return {
          success: 0,
          message: "did not fetch count of documents"
        }
      })
      if (requestDetailsCount && requestDetailsCount.success && requestDetailsCount.success === 0) {
        return res.send(requestDetailsCount);
      }
      if (requestDetailsCount > 0) {
        return res.send({
          success: 1,
          message: "link to join class",
          link: classDetails.zoomLink
        })

      }
      else {
        return res.send({
          success: 0,
          message: "link to join class can not be provided since class is private and you have not requested or request is approved"

        })
      }
    }
  } else {
    return res.send({
      success: 0,
      message: "Class not exists"
    })
  }

}

exports.getZoomStartLink = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.params;
  var classId = params.id;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var findCriteria = {
    _id: classId,
    userId,
    status: 1
  }
  var projection = {
    startUrl: 1,
    isApproved: 1,
  }
  var checkClassResp = await OnlineCLass.findOne(findCriteria, projection)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get class details',
        error: err
      }
    })
  if (checkClassResp && (checkClassResp.success !== undefined) && (checkClassResp.success === 0)) {
    return res.send(checkClassResp);
  }
  if (checkClassResp) {
    console.log()
    if (checkClassResp.isApproved) {
      return res.send({
        success: 1,
        message: "Zoom link to start class",
        link: checkClassResp.startUrl
      })
    } else {
      return res.send({
        success: 0,
        message: "Not approved class"
      })
    }

  } else {
    return res.send({
      success: 0,
      message: "Class not exists"
    })
  }
}

exports.getClassDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var classId = req.params.id;

  var classId = req.params.id;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
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
    }, {
      path: 'currencyId',
    },
    {
      path: 'tutorSyllabusId',
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
    classDetails = JSON.parse(JSON.stringify(classDetails))
    var checkResp = await checkIfJoinLinkAvailable(classDetails, userId);
    if (checkResp && (checkResp.success !== undefined) && (checkResp.success === 0)) {
      return res.send(checkResp);
    }
    if (favouriteData && favouriteData.favouriteClass !== null && favouriteData.favouriteClass !== undefined) {
      var index = await favouriteData.favouriteClass.findIndex(id => JSON.stringify(id) === JSON.stringify(classId));
      if (index > -1) {
        classDetails.isFavourite = true;
      } else {
        classDetails.isFavourite = false;
      }
    } else {
      classDetails.isFavourite = false;
    }

    return res.send({
      success: 1,
      flag: 1,
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

  console.log("test for identifying api success");

  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;

  var findCriteria = {};
  var sortOptions = {};

  if (params.isFavourite !== undefined && params.isFavourite === 'true') {
    findCriteria = { _id: { $in: favouriteData.favouriteClass } };
  }
  if (favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor) {
    findCriteria.userId = { $ne: userId }
  }

  if (params.filters) {

    var reqFilters = JSON.parse(params.filters);

    var availableFilters = constants.ONLINE_CLASS_FILTERS;

    findCriteria = await setFIlter(reqFilters, availableFilters, findCriteria)
  }
  if (params.isPublic !== undefined && params.isPublic === 'true') {
    findCriteria.isPublic = true;
  }
  if (params.isPublic !== undefined && params.isPublic === 'false') {
    findCriteria.isPublic = false;
  }
  if (params.isPopular === 'true') {
    findCriteria.isPopular = true;
  }

  if (params.isFeeLowToHigh === 'true') {
    sortOptions = {
      'fee': 1
    }
  } else if (params.isFeeLowToHigh === 'false') {
    sortOptions = {
      'fee': -1
    }
  } else {
    sortOptions = {
      'tsCreatedAt': -1
    }
  }

  if (params.itemType === constants.SUBJECT_SEARCH_TYPE
    && params.itemId !== undefined && params.itemId !== null) {
    findCriteria.tutorSubjectId = params.itemId
  }

  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;

  //rakesh 

  if (params.search != undefined) {
    var search = params.search;
    findCriteria = {
      $or: [{
        title: {
          $regex: search,
          $options: 'i',
        }
      }, {
        classDescription: {
          $regex: search,
          $options: 'i'
        }
      }, {
        tutorName: {
          $regex: search,
          $options: 'i'
        }
      }]
    };
  }
  console.log(findCriteria, "flag", search)
  //end rakesh's mods
  var listClassResp = await listClasses(findCriteria, params.perPage, params.page, favouriteData, sortOptions);
  return res.send(listClassResp);
}

exports.listTutorList = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
  var findCriteria = {};
  var params = req.query;
  if (params.isFavourite !== undefined && params.isFavourite === 'true') {
    findCriteria = { _id: { $in: favouriteData.favouriteTutor } };
  }
  if (params.filters) {
    var reqFilters = JSON.parse(params.filters);
    var availableFilters = constants.TUTOR_FILTERS;
    findCriteria = await setFIlter(reqFilters, availableFilters, findCriteria)
  }
  if (params.isPopular === 'true') {
    findCriteria.isPopular = true;
  }
  if (favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor) {
    findCriteria._id = { $ne: userId }
  }
  findCriteria.isTutor = true;
  findCriteria.status = 1;


  var listTutorResp = await listTutors(findCriteria, params.perPage, params.page, favouriteData)
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
    .populate([{ path: 'tutorSubjectId', }, { path: 'tutorClassId', }]).limit(perPage).skip(offset).sort({
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

  var totalOnlineClassCount = await OnlineCLass.countDocuments(findCriteria).catch(err => {
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
  return res.status(200).send({
    success: 1,
    pagination,
    imageBase: classConfig.imageBase,
    items: onlineClassData,
    message: 'List latest class'
  })


}


exports.listApointmentsForTutor = async (req, res) => {
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

  var AppointmentClassRequestData = await AppointmentClassRequest.find(findCriteria)
    .populate([{ path: 'userId' }, { path: 'tutorClassId' }, { path: 'tutorSubjectId' }]).limit(perPage).skip(offset).sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (AppointmentClassRequestData && (AppointmentClassRequestData.success !== undefined) && (AppointmentClassRequestData.success === 0)) {
    return AppointmentClassRequestData;
  }

  var AppointmentClassRequestDataCount = await OnlineCLass.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding online class count',
        error: err
      }
    })
  if (AppointmentClassRequestDataCount && (AppointmentClassRequestDataCount.success !== undefined) && (AppointmentClassRequestDataCount.success === 0)) {
    return AppointmentClassRequestDataCount;
  }

  totalPages = AppointmentClassRequestDataCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: AppointmentClassRequestDataCount,
    totalPages
  }
  return res.status(200).send({
    success: 1,
    pagination,
    imageBase: usersConfig.imageBase,
    items: AppointmentClassRequestData,
    message: 'List latest requests'
  })


}

// request tutor by rakesh 


exports.getStudentHome1 = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  const tabType = params.tabType;

  switch (tabType) {
    case "public":
      publicTabResponse(req, res)
    case "private":
      return res.send("private")
    case "favourites":
      return res.send("favourites")
  }

}

async function publicTabResponse(req, res) {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var filter1 = {};
  filter1.isPopular = true;
  filter1.status = 1;

}

exports.getStudentHome = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  console.log("userId : " + userId)
  var tabCheckData = await checkYourTab(params, userId);
  if (tabCheckData && (tabCheckData.success !== undefined) && (tabCheckData.success === 0)) {
    return res.send(tabCheckData);
  }

  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;

  var findCriteria = {};
  if (tabCheckData.isPublic !== null) {
    findCriteria.isPublic = tabCheckData.isPublic
  } else if (tabCheckData.isFavourite !== null && tabCheckData.isFavourite) {
    // if (tabCheckData.favourites.favouriteClasses) {
    findCriteria = { _id: { $in: tabCheckData.favourites.favouriteClasses } };
    // }
  }

  if (params.keyword) {
    findCriteria.title = {
      $regex: `.*${params.keyword}.*`,
    }
  }
  if (favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor) {
    findCriteria.userId = { $ne: userId }
  }

  findCriteria.isPopular = true;
  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  var perPage = classConfig.popularInHomeResultsPerPage;
  var page = 1;

  var listPopularClassData = await listClasses(findCriteria, perPage, page, favouriteData);
  if (listPopularClassData && (listPopularClassData.success !== undefined) && (listPopularClassData.success === 0)) {
    return res.send(listPopularClassData);
  }

  perPage = tutorConfig.popularInHomeResultsPerPage;
  findCriteria = {};
  // if (tabCheckData.isFavourite !== null && tabCheckData.isFavourite) {
  //   // if (tabCheckData.favourites.favouriteTutors) {
  //   findCriteria = { _id: { $in: tabCheckData.favourites.favouriteTutors } };
  //   // }
  // }
  if (params.keyword) {
    findCriteria.firstName = {
      $regex: `.*${params.keyword}.*`,
    }
  }
  if (favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor) {
    console.log(tabCheckData,)
    if (tabCheckData.favourites) {
      findCriteria._id = { $in: tabCheckData.favourites.favouriteTutors };
    }
    else {
      findCriteria._id = { $ne: userId }
    }
  }

  findCriteria.isPopular = true;
  findCriteria.isTutor = true;
  findCriteria.status = 1;

  var listPopularTutorData = await listTutors(findCriteria, params.perPage, params.page, favouriteData)
  if (listPopularTutorData && (listPopularTutorData.success !== undefined) && (listPopularTutorData.success === 0)) {
    return res.send(listPopularTutorData);
  }

  perPage = classConfig.latestInHomeResultsPerPage;


  findCriteria = {};
  if (tabCheckData.isPublic !== null) {
    findCriteria.isPublic = tabCheckData.isPublic
  } else if (tabCheckData.isFavourite !== null && tabCheckData.isFavourite) {
    // if (tabCheckData.favourites.favouriteClasses) {
    findCriteria = { _id: { $in: tabCheckData.favourites.favouriteClasses } };
    // }
  }
  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  if (params.keyword) {
    findCriteria.title = {
      $regex: `.*${params.keyword}.*`,
    }
  }
  findCriteria.isPopular = false;
  if (favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor) {
    findCriteria.userId = { $ne: userId }
  }

  var d1 = Date.now();

  var d2 = 1000 * 60 * 60 * 24 * 7;

  findCriteria.tsCreatedAt = { $gt: (d1 - d2) };



  var listLatestClassData = await listClasses(findCriteria, perPage, page, favouriteData);
  if (listLatestClassData && (listLatestClassData.success !== undefined) && (listLatestClassData.success === 0)) {
    return res.send(listLatestClassData);
  }

  var instituteList = [];
  if (tabCheckData.isFavourite !== null && tabCheckData.isFavourite) {

    instituteList = await listInstitutes(userId, perPage, page,);

  }

  return res.send({
    success: 1,
    popularClasses: listPopularClassData.items,
    popularTutors: listPopularTutorData.items,
    latestClasses: listLatestClassData.items,
    institutes: instituteList,

    classImageBase: classConfig.imageBase,
    tutorImageBase: usersConfig.imageBase,
    message: 'Student home 1'
  })
}

async function listInstitutes(userId, perPage, page) {


  var data = await FavouriteInstitute.find({ status: 1, userId: userId }, { instituteId: 1 }, { perPage: perPage, page: page }).populate({ path: "instituteId" }).catch(err => {
    return { success: 0, message: "some thing went wrong", error: err.message }
  });

  if (data && data.succes != undefined && data.success === 0) {
    return [];
  }


  return data;

}

exports.getTutorDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
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
    }
    ])
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
    tutorDetails = JSON.parse(JSON.stringify(tutorDetails));
    if (favouriteData && favouriteData.favouriteTutor !== null && favouriteData.favouriteTutor !== undefined) {
      var index = await favouriteData.favouriteTutor.findIndex(id => JSON.stringify(id) === JSON.stringify(tutorId));
      if (index > -1) {
        tutorDetails.isFavourite = true;
      } else {
        tutorDetails.isFavourite = false;
      }
    } else {
      tutorDetails.isFavourite = false;
    }
    var onlineClassData = await OnlineCLass.find({ status: 1, userId: tutorId, isApproved: true, isPublic: true }, { zoomLink: 0, startUrl: 0 })
      .populate([{
        path: 'userId',
        select: {
          firstName: 1,
          image: 1,
          socialPhotoUrl: 1
        }
      }, {
        path: 'tutorSubjectId',
      }, {
        path: 'tutorClassId',
      }])
      .limit(5)
      .skip(0)
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

    return res.send({
      success: 1,
      item: tutorDetails,
      tutorVideoBase: tutorConfig.videoBase,
      tutorImageBase: usersConfig.imageBase,
      classImageBase: classConfig.imageBase,
      previousClasses: onlineClassData,
      message: 'Tutor details'
    })
  } else {
    return res.send({
      success: 0,
      message: "Tutor not exists"
    })
  }
}

exports.requestAppointment1 = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.body;

  if (!params.tutorId || !params.classId) {
    var errors = [];
    if (!params.tutorId) {
      errors.push({
        field: "tutorId",
        message: "tutor id missing"
      });
    }
    if (!params.classId) {
      errors.push({
        field: "classId",
        message: "class id missing"
      });
    }

    return res.send({
      success: 0,
      errors: errors,
      code: 200
    });
  }

  var obj = {}
  obj.tutorId = params.tutorId;
  obj.classId = params.classId;
  obj.status = 1;
  obj.tsCreatedAt = Date.now();
  obj.tsModifiedAt = null;
  obj.userId = userId;

  var request = new classRequest(obj);

  var saveData = await request.save().catch(err => {
    return { success: 0, err: err.message }
  });

  if (saveData && saveData.success && saveData.success == 0) {
    return res.send(saveData)
  }

  return res.send({
    success: 1,
    message: "submitted your request"
  })

}

exports.requestAppointment = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  console.log("mark ------------>")
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
    return res.send({
      success: 0,
      errors: errors,
      code: 200
    });
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
  appointmentClassRequestObj.isStudentDeleted = false;
  appointmentClassRequestObj.isTutorDeleted = false;
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
    && params.status !== constants.REJECTED_STATUS) ||
    (params.status && params.status === constants.REJECTED_STATUS && !params.comments)) {
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
    if ((params.status && params.status === constants.REJECTED_STATUS && !params.comments)) {
      errors.push({
        'field': 'comments',
        'message': 'comments required',
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
  var comments = null;
  var notificationMessage = ""



  var checkAppointment = await AppointmentClassRequest.findOne({
    _id: appointmentId,
    tutorId: userId,
    status: 1
  })
    .populate([{
      path: 'tutorId'
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
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
    var subjectName = checkAppointment.tutorSubjectId.name;
    var className = checkAppointment.tutorClassId.name;
    var tutorName = checkAppointment.tutorId.firstName;
    if (params.status === constants.APPROVED_STATUS) {
      isApproved = true;
      comments = null;
      message = 'Appointment accepted successfully'

      notificationMessage = tutorName + ' accepted your subject ' + subjectName + ' for class ' + className;
    } else {
      message = 'Appointment rejected successfully'
      notificationMessage = tutorName + ' rejected your subject' + subjectName + ' for class ' + className;

      isRejected = false;
      comments = params.comments;
    }
    var checkAppointmentResp = await checkAppointmentStatusCheck(checkAppointment, isApproved, isRejected, comments)
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

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": checkAppointment.userId }]
    // var metaInfo = {"type":"event","reference_id":eventData.id}
    var notificationObj = {
      title: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TITLE,
      message: notificationMessage,
      type: constants.APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TYPE,
      referenceId: appointmentId,
      filtersJsonArr,
      // metaInfo,
      tutorId: userId,
      userId: checkAppointment.userId,
      notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)


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

exports.deleteStudentAppointmentHistory = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var appointmentId = req.params.id;

  var findCriteria = {};
  findCriteria._id = appointmentId;
  findCriteria.userId = userId;
  findCriteria.status = 1;
  var checkAppointmentHistoryResp = await checkAppointmentHistoryRequest(findCriteria, constants.STUDENT_TYPE)
  if (checkAppointmentHistoryResp && (checkAppointmentHistoryResp.success !== undefined) && (checkAppointmentHistoryResp.success === 0)) {
    return res.send(checkAppointmentHistoryResp);
  }

  var update = {};
  update.isStudentDeleted = true;
  update.tsModifiedAt = Date.now();
  var updateAppointmentHistoryResp = await updateAppointmentHistoryRequest(findCriteria, update);
  return res.send(updateAppointmentHistoryResp);
}


exports.deleteTutorDeleteAppointmentHistory = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }

  var appointmentId = req.params.id;

  var findCriteria = {};
  findCriteria._id = appointmentId;
  findCriteria.tutorId = userId;
  findCriteria.status = 1;
  var checkAppointmentHistoryResp = await checkAppointmentHistoryRequest(findCriteria, constants.TUTOR_TYPE)
  if (checkAppointmentHistoryResp && (checkAppointmentHistoryResp.success !== undefined) && (checkAppointmentHistoryResp.success === 0)) {
    return res.send(checkAppointmentHistoryResp);
  }

  var update = {};
  update.isTutorDeleted = true;
  update.tsModifiedAt = Date.now();
  var updateAppointmentHistoryResp = await updateAppointmentHistoryRequest(findCriteria, update);
  return res.send(updateAppointmentHistoryResp);
}

exports.getStudentAppointmentRequestList = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var findCriteria = {};
  findCriteria.userId = userId;
  findCriteria.isStudentDeleted = false;

  findCriteria.status = 1;

  var appointmentRequestListResp = await getAppointmentRequestList(findCriteria, params.perPage, params.page);

  return res.send(appointmentRequestListResp);
}

exports.getTutorAppointmentRequestList = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }

  var params = req.query;

  var findCriteria = {};
  findCriteria.tutorId = userId;
  findCriteria.isTutorDeleted = false;
  findCriteria.isStudentDeleted = false;
  findCriteria.status = 1;

  var appointmentRequestListResp = await getAppointmentRequestList(findCriteria, params.perPage, params.page);
  return res.send(appointmentRequestListResp);
}

exports.getTutorAppointmentRequestList1 = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;
  var query = req.query;
  var page = Number(query.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(query.perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var pageParams = {
    skip: offset,
    limit: perPage
  };

  console.log(userId);

  var list = await classRequest.find({status:1,tutorId:userId},{},pageParams).populate("userId").populate('classId').catch(err=>{
    return {
      success:0,
      message:err.message
    }
  })

  var dataCount = await classRequest.countDocuments({status:1,tutorId:userId}).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err.message
    }
  })
  if (dataCount && (dataCount.success !== undefined) && (dataCount.success === 0)) {
    return res.send(dataCount);
  }

  var totalPages = dataCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
      page: page,
      perPage: perPage,
      hasNextPage: hasNextPage,
      totalItems: dataCount,
      totalPages: totalPages
  }

  return res.send({
    success:1,
    message:"listed",
    items:list,
    pagination
  })
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

async function listClasses(findCriteria, perPage, page, favouriteData, sortOptions) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;


  var onlineClassData = await OnlineCLass.find(findCriteria, { zoomLink: 0, startUrl: 0 })
    .populate([{
      path: 'userId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
      }
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }, {
      path: 'tutorSyllabusId',
    }])
    .limit(perPage)
    .skip(offset)
    .sort(sortOptions)
    .catch(err => {
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
  onlineClassData = JSON.parse(JSON.stringify(onlineClassData))
  var favouriteClassData = []
  if (favouriteData && favouriteData.favouriteClass && favouriteData.favouriteClass !== null) {
    favouriteClassData = favouriteData.favouriteClass;
  }

  onlineClassData = await checkAndSetFavourite(onlineClassData, favouriteClassData)
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
    videoBase: classConfig.videoBase,
    items: onlineClassData,
    message: 'List latest class'
  }
}


async function listTutors(findCriteria, perPage, page, favouriteData) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || tutorConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : tutorConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  console.log("now filter ->", findCriteria)

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
  tutorsData = JSON.parse(JSON.stringify(tutorsData))
  var favouriteTutorData = []
  if (favouriteData && favouriteData.favouriteTutor && favouriteData.favouriteTutor !== null) {
    favouriteTutorData = favouriteData.favouriteTutor;
  }
  tutorsData = await checkAndSetFavourite(tutorsData, favouriteTutorData)
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
    imageBase: usersConfig.imageBase,
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
    var favourites = await getFavouriteDetails(params, userId);
    console.log(3, favourites)


    return {
      success: 1,
      isFavourite: true,
      isPublic: null,
      favourites: favourites,
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

async function getFavouriteDetails(params, userId) {

  var returnObject = {};

  var infoFavourites = await User.findOne({ status: 1, _id: userId }, { _id: 1, favouriteClass: 1, favouriteTutor: 1 })
    .catch(error => {

      return {
        success: 0,
        error: error.message,
        message: "could not get favourite classes"
      }
    });

  if (infoFavourites && infoFavourites.success && infoFavourites.success === 0) {
    return infoFavourites
  }
  console.log(1, infoFavourites, userId);
  if (infoFavourites != null) {
    returnObject.favouriteClasses = infoFavourites.favouriteClass;
    returnObject.favouriteTutors = infoFavourites.favouriteTutor;
  }
  else {
    return {
      success: 0,
      message: "No recored for this user"
    }
  }

  return returnObject;

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



async function checkAppointmentStatusCheck(appointmentData, isApproved, isRejected, comments) {
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
    findCriteria.tutorSubjectId = appointmentData.tutorSubjectId.id;
    findCriteria.tutorClassId = appointmentData.tutorClassId.id;
    findCriteria.isPublic = false;
    findCriteria.isApproved = true;
    findCriteria.isRejected = false;
    findCriteria.status = 1;

    console.log(findCriteria, "31/03")

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
        message: 'Requested online class not yet approved, please contact admin',
      };
    } else {
      updateObj.isApproved = true;
      updateObj.comments = null;
      updateObj.tsModifiedAt = Date.now();

      return {
        success: 1,
        message: 'Approve status',
        update: updateObj
      }
    }
  } else {
    updateObj.isRejected = true;
    updateObj.comments = comments;
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
    if (JSON.stringify(userId) === JSON.stringify(classDetails.userId.id)) {
      return {
        success: 1,
        joinLinkAvailable: false,
        message: 'Public class'
      }
    } else {
      return {
        success: 1,
        joinLinkAvailable: true,
        message: 'Public class'
      }
    }

  } else {
    var appointmentCheckResp = await AppointmentClassRequest.findOne({
      userId,
      tutorId: classDetails.userId.id,
      tutorSubjectId: classDetails.tutorSubjectId.id,
      tutorClassId: classDetails.tutorClassId.id,
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
      if (JSON.stringify(userId) === JSON.stringify(classDetails.userId.id)) {
        return {
          success: 1,
          joinLinkAvailable: false,
          message: 'Private class with approved appointment request'
        }
      } else {
        return {
          success: 1,
          joinLinkAvailable: true,
          message: 'Private class with approved appointment request'
        }
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

async function getUserFavouriteData(userId) {
  var favouriteData = await User.findOne({
    _id: userId,
    status: 1
  }, {
    favouriteTutor: 1,
    favouriteClass: 1,
    isTutor: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting favourite data',
        error: err
      }
    })
  if (favouriteData && (favouriteData.success !== undefined) && (favouriteData.success === 0)) {
    return favouriteData;
  }
  if (favouriteData && favouriteData !== null) {
    return {
      success: 1,
      favouriteData,
      message: 'Users favourite data',
    }
  } else {
    return {
      success: 0,
      message: 'User not exists',
    }
  }
}

async function checkAndSetFavourite(listData, favouriteData) {
  if (favouriteData && favouriteData.length > 0) {
    for (let i = 0; i < listData.length; i++) {
      let index = await favouriteData.findIndex(id => JSON.stringify(id) === JSON.stringify(listData[i].id));
      if (index > -1) {
        listData[i].isFavourite = true;
      } else {
        listData[i].isFavourite = false;
      }
    }
    return listData;
  } else {
    for (let i = 0; i < listData.length; i++) {
      listData[i].isFavourite = false;
    }
    return listData;
  }
}


async function setFIlter(reqFilters, availableFilters, findCriteria) {
  var i = 0;
  var j;
  var k;
  while (i < availableFilters.length) {
    j = 0;
    filtersLen = reqFilters.length;
    console.log("User entered filters length is " + filtersLen);
    while (j < filtersLen) {
      if (reqFilters[j].name == availableFilters[i].name) {
        var reqValues = [];
        if (reqFilters[j].values && Array.isArray(reqFilters[j].values) && reqFilters[j].values.length) {
          k = 0;
          while (k < reqFilters[j].values.length) {
            if (ObjectId.isValid(reqFilters[j].values[k]))
              reqValues.push(reqFilters[j].values[k]);
            k++;
          }
          findCriteria[String(availableFilters[i].value)] = {
            $in: reqValues
          };
          console.log("Filters Upadated" + JSON.stringify(findCriteria));
        }
      }
      j++;
    }
    i++;
  }

  return findCriteria;
}


async function getAppointmentRequestList(findCriteria, perPage, page) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || appointmentConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : appointmentConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var appointmentClassRequestData = await AppointmentClassRequest.find(findCriteria)
    .populate([{
      path: 'userId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
      }
    }, {
      path: 'tutorId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
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
        message: 'Something went wrong while getting  appointment class requests',
        error: err
      }
    })
  if (appointmentClassRequestData && (appointmentClassRequestData.success !== undefined) && (appointmentClassRequestData.success === 0)) {
    return appointmentClassRequestData;
  }
  var totalAppointmentClassRequestCount = await AppointmentClassRequest.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding appointment class request count',
        error: err
      }
    })
  if (totalAppointmentClassRequestCount && (totalAppointmentClassRequestCount.success !== undefined) && (totalAppointmentClassRequestCount.success === 0)) {
    return totalAppointmentClassRequestCount;
  }


  totalPages = totalAppointmentClassRequestCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalAppointmentClassRequestCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase: usersConfig.imageBase,
    items: appointmentClassRequestData,
    message: 'List appointment request'
  }
}


async function checkAppointmentHistoryRequest(findCriteria, type) {
  var appointmentCheck = await AppointmentClassRequest.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking appointment class request',
        error: err
      }
    })
  if (appointmentCheck && (appointmentCheck.success !== undefined) && (appointmentCheck.success === 0)) {
    return appointmentCheck;
  }
  if (appointmentCheck) {
    if (appointmentCheck.isApproved === false && appointmentCheck.isRejected === false) {
      return {
        success: 0,
        message: 'Appointment is currently pending..so can not delete',
      }
    } else {
      if (type === constants.STUDENT_TYPE && appointmentCheck.isStudentDeleted) {
        return {
          success: 0,
          message: 'Appointment request is already deleted',
        }
      } else if (type === constants.TUTOR_TYPE && appointmentCheck.isTutorDeleted) {
        return {
          success: 0,
          message: 'Appointment request is already deleted',
        }
      } else {
        return {
          success: 1,
          message: 'Appointment check OK..',
        }
      }

    }
  } else {
    return {
      success: 0,
      message: 'Invalid appointment',
    }
  }
}


async function updateAppointmentHistoryRequest(findCriteria, update) {
  var updateAppointmentRequest = await AppointmentClassRequest.updateOne(findCriteria, update)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while deleting appointment class request from history',
        error: err
      }
    })
  if (updateAppointmentRequest && (updateAppointmentRequest.success !== undefined) && (updateAppointmentRequest.success === 0)) {
    return updateAppointmentRequest;
  }
  return {
    success: 1,
    message: 'Deleted appointment from history'
  }
}



exports.createInstitution = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;


  var file = req.files;

  var errors = [];

  //console.log("parameters => ", params)

  if (!req.body.location) {
    errors.push({
      field: "location",
      message: "location cannot be empty"
    })
  }
  if (!file) {
    errors.push({
      field: "image",
      message: "Please select a class image"
    })
  }
  if (!req.body.phone) {
    errors.push({
      field: "phone",
      message: "phone cannot be empty"
    })
  }
  if (!req.body.name) {
    errors.push({
      field: "name",
      message: "name cannot be empty"
    })
  }


  if (errors.length > 0) {

    return res.status(200).send({
      success: 0,
      errors: errors,

      code: 200
    });
  }
  var params = req.body;

  var institutionObj = {};
  institutionObj.userId = userId;
  institutionObj.phone = params.phone;
  institutionObj.location = params.location;
  institutionObj.name = params.name;
  institutionObj.email = params.email;
  if (file.image && file.image.length > 0) {
    institutionObj.image = file.image[0].filename;
  }


  institutionObj.status = 1;
  institutionObj.tsCreatedAt = Date.now();
  institutionObj.tsModifiedAt = null;
  //rakesh 

  var newInstituion = new Instituion(institutionObj);
  var response = await newInstituion.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving online class',
        error: err
      }
    })
  if (response && (response.success !== undefined) && (response.success === 0)) {
    return res.send(response);
  }
  return res.send({
    success: 1,
    statusCode: 200,
    filename: file.filename,
    message: 'Created a institution..waiting for admin approval',
  })

}


exports.listInstitutesAtHome = async (req, res) => {

  var params = req.query;

  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var pageParams = {
    skip: offset,
    limit: perPage
  };

  var inst_list = await Instituion.find({ status: 1 }, { name: 1, image: 1, location: 1, email: 1, phone: 1 }, pageParams).catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err
    }
  })

  // var inst_list_popular = await Instituion.find({status:1,isPopular:true},{name:11,image:1,location:1}).limit(page2).skip(offset2).catch(err=>{
  //   return {
  //     success: 0,
  //     message: 'Something went wrong while listing institutes',
  //     error: err
  //   }
  // })

  if (inst_list && (inst_list.success !== undefined) && (inst_list.success === 0)) {
    return res.send(inst_list);
  }
  // if (inst_list_popular && (inst_list_popular.success !== undefined) && (inst_list_popular.success === 0)) {
  //   return res.send(inst_list_popular);
  // }

  var dataCount = await Instituion.countDocuments({ status: 1 }).catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err.message
    }
  })
  if (dataCount && (dataCount.success !== undefined) && (dataCount.success === 0)) {
    return res.send(dataCount);
  }

  var totalPages = dataCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page: page,
    perPage: perPage,
    hasNextPage: hasNextPage,
    totalItems: dataCount,
    totalPages: totalPages
  }

  var ret_Obj = {};
  ret_Obj.success = 1;
  ret_Obj.imageBase = classConfig.imageBase;
  ret_Obj.message = "listed Successfully"
  ret_Obj.insitutes = inst_list;

  ret_Obj.pagination = pagination;
  return res.send(ret_Obj);

}

exports.detailInstitution = async (req, res) => {


  var userData = req.identity.data;
  var userId = userData.userId;

  var id = req.params.id;


  var detail = await Instituion.findOne({ status: 1, _id: id }, { tsCreatedAt: 0, tsModifiedAt: 0, status: 0 }).catch(err => {
    return { success: 0, err: err.message, message: "could not fetch data" };
  })
  if (detail && (detail.success !== undefined) && (detail.success === 0)) {
    return res.send(detail);
  }

  var isOwner = 0;
  if (detail.userId == userId) {
    isOwner = 1;
  }

  var detailListClasses = await InstitutionClass.find({ status: 1, institution: id }, { tsCreatedAt: 0, tsModifiedAt: 0, status: 0 }).populate({ path: "tutorSubjectId", select: "name" }).catch(err => {
    return { success: 0, err: err.message, message: "could not fetch data" };
  })
  if (detailListClasses && (detailListClasses.success !== undefined) && (detailListClasses.success === 0)) {
    return res.send(detailListClasses);
  }

  var isFavourite = false;

  const cnt = await FavouriteInstitute.countDocuments({ status: 1, userId: userId, instituteId: req.params.id }).catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  });

  if (cnt && cnt.success !== undefined && cnt.success === 0) {
    return res.send(cnt);
  }

  if (cnt > 0) {
    isFavourite = true;
  }



  var ret_Obj = {};
  ret_Obj.success = 1;
  ret_Obj.message = "fetched data successfully";
  ret_Obj.imageBase = classConfig.imageBase;
  ret_Obj.detail = detail;
  ret_Obj.isOwner = isOwner;
  ret_Obj.listClasses = detailListClasses;
  ret_Obj.isFavourite = isFavourite;
  return res.send(ret_Obj);

}

exports.addClass = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;

  // var tutorCheck = await checkUserIsTutor(userId);
  // if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
  //   return res.send(tutorCheck);
  // }
  var params = req.body;

  var file = req.files;




  var errors = [];

  if (!req.body.institution) {
    errors.push({
      field: "institution",
      message: "institution cannot be empty"
    })
  }


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
  if (!req.body.availableFromTime) {
    errors.push({
      field: "availableFromTime",
      message: "starting time cannot be empty"
    })
  }
  if (!req.body.availableToTime) {
    errors.push({
      field: "availableToTime",
      message: "end time cannot be empty"
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
  if (params.isPaid === 'true' && !params.classTimeCategory) {
    errors.push({
      field: "classTimeCategory",
      message: "classTimeCategory cannot be empty"
    })
  }
  if ((params.isPaid === 'true' && !params.currencyId)) {
    errors.push({
      field: "currencyId",
      message: "currencyId cannot be empty"
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

  if (!params.tutorSyllabusId) {
    errors.push({
      field: "tutorSyllabusId",
      message: "tutorSyllabusId cannot be empty"
    })
  }


  if (errors.length > 0) {

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

  var updateTutorProfile = await updateClassAndSubject(params.tutorClassId, params.tutorSubjectId, userId);

  if (updateTutorProfile == 0) {
    return res.send({
      success: 0,
      message: "could not update tutor profile"
    })
  }

  var owner = await Instituion.countDocuments({ _id: req.body.institution, userId: userId }).catch(err => {
    return { success: 0, message: "could not fetch data about institution", err: err.message }
  })

  if (owner.success && owner.success != undefined && owner.success == 0) {
    return res.send(owner)
  }

  if (owner == 0) {
    return res.send({ success: 0, message: "you are not authorized for this action" })
  }


  onlineClassObj.classDescription = params.classDescription;
  if (file.image && file.image.length > 0) {
    onlineClassObj.image = file.image[0].filename;
  }
  if (file.video && file.video.length > 0) {
    onlineClassObj.video = file.video[0].filename;
  }
  onlineClassObj.isPaid = params.isPaid;
  onlineClassObj.institution = params.institution;
  onlineClassObj.title = params.title;
  onlineClassObj.tutorSyllabusId = params.tutorSyllabusId;
  onlineClassObj.isPopular = false;
  if (params.isPaid === 'true') {
    onlineClassObj.isPaid = true;
    onlineClassObj.fee = params.fee;
    onlineClassObj.classTimeCategory = params.classTimeCategory;
    onlineClassObj.currencyId = params.currencyId;
  } else {
    onlineClassObj.isPaid = false;
    onlineClassObj.fee = null;
    onlineClassObj.classTimeCategory = null;
    onlineClassObj.currencyId = null;

  }
  if (params.isPublic === 'true') {
    onlineClassObj.isPublic = true;
  } else {
    onlineClassObj.isPublic = false;
  }

  if (params.availableDays.length == 0) {
    return res.send({
      success: 0,
      message: "select at least one day"
    })
  }

  onlineClassObj.availableDays = params.availableDays;
  onlineClassObj.availableTime = params.availableTime;
  onlineClassObj.isApproved = false;
  onlineClassObj.isRejected = false;
  onlineClassObj.status = 1;
  onlineClassObj.tsCreatedAt = Date.now();
  onlineClassObj.tsModifiedAt = null;


  var tutorName = await User.findOne({ _id: params.userId, status: 1 }, { firstName: 1 }).catch(err => {
    return { success: 0, message: err.message };
  })

  if (tutorName && (tutorName.success !== undefined) && (tutorName.success === 0)) {
    return res.send(tutorName);
  }

  onlineClassObj.tutorName = tutorName;

  onlineClassObj.tutorSubject = params.tutorSubject;
  onlineClassObj.tutorClass = params.tutorClass;
  onlineClassObj.tutorSyllabus = params.tutorSyllabus;
  onlineClassObj.qualification = params.qualification;
  onlineClassObj.category = params.category;
  onlineClassObj.availableFromTime = params.availableFromTime;
  onlineClassObj.availableToTime = params.availableToTime;

  var newOnlineClassObj = new InstitutionClass(onlineClassObj);
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
    filename: file.filename,
    message: 'Created a class..waiting for admin approval',
  })
}

exports.removeAll = async (req, res) => {

  var update = await OnlineCLass.updateMany({}, { status: 0 }).catch(err => { })

  var cnt = await OnlineCLass.countDocuments({ status: 0 }).catch(err => { return { err: err.message } });

  return res.send({ number: cnt });
}

exports.addFavouriteInstitution = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;

  const cnt = await FavouriteInstitute.countDocuments({ status: 0, userId: userId, instituteId: req.params.id }).catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  });

  if (cnt && cnt.success !== undefined && cnt.success === 0) {
    return res.send(cnt);
  }

  if (cnt > 0) {
    const saveData = await FavouriteInstitute.updateOne({ status: 0, instituteId: req.params.id, userId: userId }, { status: 1 }).catch(err => {
      return {
        success: 0,
        message: "success",
        error: err.message,
      }
    })

    if (saveData && saveData.success !== undefined && saveData.success === 0) {
      return res.send(saveData);
    }

    return res.send({ success: 1, message: "added to favourites" })
  }



  const newObj = {
    userId: userId,
    instituteId: req.params.id,
    status: 1,
    tsCreatedAt: Date.now(),
  }

  const data = new FavouriteInstitute(newObj);

  const saveData = await data.save().catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "added to favourites" })


}

exports.removeFavouriteInstitution = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;

  const saveData = await FavouriteInstitute.updateOne({ status: 1, instituteId: req.params.id, userId: userId }, { status: 0 }).catch(err => {
    return {
      success: 0,
      message: "success",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "removed from favourites" })


}

exports.listInstitutionClassAppointment = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;

  var classId = req.params.id;

  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };

  var data1 = await InstituteClassAppointmentRequest.find({ status: 1, instituteClassId: classId }, {}, pageParams).populate([{ path: 'instituteClassId', select: { 'availableFromTime': 1, 'availableToTime': 1, 'title': 1, 'image': 1 } }, { path: 'userId', select: { 'firstName': 1, 'image': 1 } }, { path: 'tutorSubjectId' }, { path: 'tutorClassId' }]).catch(err => {
    return { success: 0, message: "something went wrong", error: err.message };
  })
  if (data1 && data1.success !== undefined && data1.success === 0) {
    return res.send(data1);
  }

  // var arr = [];

  // for (x in data1){
  //   var data2 = {}
  //   var obj = data1[x];

  // data2['subject'] = "chemistry";
  // data2["_id"] = obj._id;
  // data2["userId"] = obj.userId;
  // data2["instituteClassId"] = obj.instituteClassId;
  // data2["isApproved"] = obj.isApproved;
  // data2["isRejected"] = obj.isRejected;

  // arr.push(data2);
  // }

  var dataCount = await InstituteClassAppointmentRequest.countDocuments({ status: 1, instituteClassId: classId }).catch(err => {
    return { success: 0, message: "something went wrong", error: err.message };
  })
  if (dataCount && dataCount.success !== undefined && dataCount.success === 0) {
    return res.send(dataCount);
  }

  var totalPages = dataCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page: page,
    perPage: perPage,
    hasNextPage: hasNextPage,
    totalItems: dataCount,
    totalPages: totalPages
  }

  return res.send({
    success: 1,
    message: "success",
    pagination,
    items: data1
  })



}

exports.rejectInstitutionClassAppointment = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;



  const saveData = await InstituteClassAppointmentRequest.updateOne({ status: 1, _id: req.params.id }, { isRejected: true }).catch(err => {
    return {
      success: 0,
      message: "success",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "removed your request" })


}
exports.acceptInstitutionClassAppointment = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;



  const saveData = await InstituteClassAppointmentRequest.updateOne({ status: 1, _id: req.params.id }, { isApproved: true }).catch(err => {
    return {
      success: 0,
      message: "success",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "removed your request" })


}


exports.addInstitutionClassAppointment = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;

  var errors = []
  if (!req.body.instituteId) {
    errors.push({
      field: "instituteId",
      message: "instituteId cannot be empty"
    })
  }
  if (!req.body.instituteClassId) {
    errors.push({
      field: "instituteClassId",
      message: "instituteClassId cannot be empty"
    })
  }

  if (!req.body.tutorSubjectId) {
    errors.push({
      field: "tutorSubjectId",
      message: "tutorSubjectId cannot be empty"
    })
  }
  if (!req.body.tutorClassId) {
    errors.push({
      field: "tutorClassId",
      message: "tutorClassId cannot be empty"
    })
  }

  if (errors.length > 0) {
    return res.status(200).send({
      success: 0,
      errors: errors,

      code: 200
    });
  }

  const cnt = await InstituteClassAppointmentRequest.countDocuments({ status: 1, userId: userId, instituteId: req.body.instituteId, instituteClassId: req.body.instituteClassId }).catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  });

  if (cnt && cnt.success !== undefined && cnt.success === 0) {
    return res.send(cnt);
  }

  if (cnt > 0) {


    return res.send({ success: 1, message: "already added to appointments" })
  }



  const newObj = {
    userId: userId,
    instituteId: req.body.instituteId,
    instituteClassId: req.body.instituteClassId,
    tutorClassId: req.body.tutorClassId,
    tutorSubjectId: req.body.tutorSubjectId,
    isApproved: false,
    isRejected: false,
    status: 1,
    tsCreatedAt: Date.now(),
  }

  const data = new InstituteClassAppointmentRequest(newObj);

  const saveData = await data.save().catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "added to appointments" })


}

exports.getInstituteClassDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var classId = req.params.id;

  var classId = req.params.id;
  // var favouriteDataResp = await getUserFavouriteData(userId);
  // if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
  //   return res.send(favouriteDataResp);
  // }
  // var favouriteData = favouriteDataResp.favouriteData;
  var classDetails = await InstitutionClass.findOne({
    _id: classId,
    // isApproved: true,
    // isRejected: false,
    status: 1
  })
    .populate([{
      path: 'userId',
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }, {
      path: 'currencyId',
    },
    {
      path: 'tutorSyllabusId',
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
    // classDetails = JSON.parse(JSON.stringify(classDetails))
    // var checkResp = await checkIfJoinLinkAvailable(classDetails, userId);
    // if (checkResp && (checkResp.success !== undefined) && (checkResp.success === 0)) {
    //   return res.send(checkResp);
    // }
    // if (favouriteData && favouriteData.favouriteClass !== null && favouriteData.favouriteClass !== undefined) {
    //   var index = await favouriteData.favouriteClass.findIndex(id => JSON.stringify(id) === JSON.stringify(classId));
    //   if (index > -1) {
    //     classDetails.isFavourite = true;
    //   } else {
    //     classDetails.isFavourite = false;
    //   }
    // } else {
    //   classDetails.isFavourite = false;
    // }

    return res.send({
      success: 1,
      flag: 1,
      item: classDetails,
      //joinLinkAvailable: checkResp.joinLinkAvailable,
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

exports.addInstitutionClassFavourite = async (req, res) => {
  const userData = req.identity.data;
  const userId = userData.userId;

  const cnt = await FavouriteClass.countDocuments({ status: 0, userId: userId, instituteId: req.params.id }).catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  });

  if (cnt && cnt.success !== undefined && cnt.success === 0) {
    return res.send(cnt);
  }

  if (cnt > 0) {
    const saveData = await FavouriteClass.updateOne({ status: 0, institutionClass: req.params.id, userId: userId }, { status: 1 }).catch(err => {
      return {
        success: 0,
        message: "success",
        error: err.message,
      }
    })

    if (saveData && saveData.success !== undefined && saveData.success === 0) {
      return res.send(saveData);
    }

    return res.send({ success: 1, message: "added to favourites" })
  }



  const newObj = {
    userId: userId,
    instituteId: req.params.id,
    status: 1,
    tsCreatedAt: Date.now(),
  }

  const data = new FavouriteInstitute(newObj);

  const saveData = await data.save().catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "added to favourites" })


}

exports.removeInstitutionClassFavourite = async (req, res) => {

  const userData = req.identity.data;
  const userId = userData.userId;

  const saveData = await FavouriteClass.updateOne({ status: 1, instituteId: req.params.id, userId: userId }, { status: 0 }).catch(err => {
    return {
      success: 0,
      message: "success",
      error: err.message,
    }
  })

  if (saveData && saveData.success !== undefined && saveData.success === 0) {
    return res.send(saveData);
  }

  return res.send({ success: 1, message: "removed from favourites" })


}