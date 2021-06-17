var moment = require('moment');
var gateway = require('../components/gateway.component.js');
const Event = require('../models/event.model.js');
const User = require('../models/user.model.js');
const EventBooking = require('../models/eventBooking.model.js')

const eventUserInterest = require('../models/eventUserInterest.model.js')
const SpeakerType = require('../models/speakerType.model')
const Timezone = require('../models/timezone.model')
const ScholarshipOrPlacement = require('../models/scholarshipOrPlacement.model')
const ScholarshipOrPlacementRequest = require('../models/scholarshipOrPlacementRequest.model')
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants.js');
var eventsConfig = config.events;
var eventSpeakerConfig = config.eventSpeaker;
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
ObjectId = require('mongodb').ObjectID;

exports.listAll = async (req, res) => {
  var filters = {
  };
  var queryProjection = {
    title: 1,
    image: 1,
    venue: 1,
    eventDate: 1,
    eventCategoryId: 1,
    category: 1,
    timeZoneId: 1,
    tsFrom: 1,
  };


  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || eventsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : eventsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };

  /* Sort */
  var sortOptions = {};
  if (params.sortBy) {
    sortOrder = null;
    if (params.sortOrder && params.sortOrder == 'asc')
      sortOrder = 1;
    if (params.sortOrder && params.sortOrder == 'desc')
      sortOrder = -1;
    if (params.sortBy == 'popularity')
      sortOptions.viewCount = sortOrder ? sortOrder : -1;
    if (params.sortBy == 'time')
      sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
  } else {
    sortOptions.tsCreatedAt = -1;
  }
  var startTs = await getStartTsToday();
  var endTs = await getEndTsToday();
  if (params.eventTimeType === constants.TODAYS_EVENT_TYPE) {
    filters = {
      tsFrom: {
        $gte: startTs,
        $lte: endTs
      }
    }
  }

  if (params.eventTimeType === constants.PAST_EVENT_TYPE) {
    filters = {
      tsTo: {
        $lt: startTs
      }
    }
  }

  if (params.eventTimeType === constants.UPCOMING_EVENT_TYPE) {
    filters = {
      tsFrom: {
        $gt: endTs
      }
    }
    sortOptions = { tsFrom: 1 };
  }

  filters.status = 1;
  Event.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['category', 'timeZoneId']).then(eventsList => {
    Event.countDocuments(filters, function (err, itemsCount) {

      /* var len = eventsList.length;
       var i =0;
       while(i<len) {
           delete eventsList[i].category;
           i++;
       } */
      totalPages = itemsCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;
      var responseObj = {
        imageBase: eventsConfig.imageBase,
        items: eventsList,
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages,
        params: params,
        sort: sortOptions,
      }

      res.send(responseObj);
    });

  });
}

exports.getDetail = async (req, res) => {

  var data = req.identity.data;
  var userId = data.userId
  var id = req.params.id;
  if (!id) {
    var responseObj = {
      success: 0,
      status: 400,
      errors: [{
        field: "id",
        message: "id is missing"
      }]
    }
    res.send(responseObj);
    return;
  }

  var ObjectId = require('mongoose').Types.ObjectId;
  var isValidId = ObjectId.isValid(id);
  if (!isValidId) {
    var responseObj = {
      success: 0,
      status: 401,
      errors: [{
        field: "id",
        message: "id is invalid"
      }]
    }
    res.send(responseObj);
    return;
  }

  var interestCount = await eventUserInterest.countDocuments({ status: 1, userId: userId, eventId: id }).catch(err => {
    return { success: 0, message: "could not count document" }
  });



  if (interestCount && (interestCount.success != undefined) && interestCount.success === 0) {
    return res.send(interestCount);
  }
  var interestAssigned = false
  if (interestCount > 0) {
    interestAssigned = true;
  }
  var filters = {
    _id: id,
    status: 1
  }
  var queryProjection = {
    _id: 1,
    title: 1,
    description: 1,
    amount: 1,
    image: 1,
    lat: 1,
    lng: 1,
    venue: 1,
    eventDate: 1,
    tsFrom: 1,
    timeZoneId: 1,
    tsTo: 1,
    eventOrganizerId: 1,
    organizer: 1,
    isFav: 1,
    speakerName: 1,
    speakerTypeId: 1,
    speakerTitle: 1,
    videoLink: 1,
    speakerOrganisation: 1,
    speakerImage: 1,
    speakerDescription: 1,
    speakerVideoLinks: 1,
    timeZoneId: 1
  }
  var findCriteria = {
    userId,
    eventId: id,
    status: 1
  }
  var eventBookingCheck = await EventBooking.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking event booking',
        error: err
      }
    })
  if (eventBookingCheck && eventBookingCheck.success && (eventBookingCheck.success === 0)) {
    return res.send(eventBookingCheck);
  }
  var startTs = await getStartTsToday();
  var endTs = await getEndTsToday();
  var isBooked = false;
  var isParticipated = false;
  if (eventBookingCheck) {
    isBooked = true;
    if (eventBookingCheck.isParticipated) {
      isParticipated = true;
    }
  }
  // get data
  Event.findOne(filters, queryProjection)
    .populate([{
      path: 'timeZone',
    }, {
      path: 'organizer',
    }])
    .then(event => {
      if (!event) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Event not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      var organizerId = event.organizer.id || null;
      organizerId = ObjectId(organizerId);
      console.log(organizerId);
      var organizerFilter = {
        status: 1,
        eventOrganizerId: organizerId
      };
      Event.countDocuments(organizerFilter, function (err, eventsCount) {
        if (err)
          eventsCount = 0;

        console.log(eventsCount);
        console.log("---------after convertion-----------")
        console.log("eventDate : " + event.eventDate)
        console.log("eventStartTime : " + event.tsFrom)
        console.log("eventEndTime : " + event.tsTo)
        eventDate = event.eventDate ? moment(event.eventDate).format('DD MMMM YYYY') : null;
        eventStartTime = event.tsFrom ? event.tsFrom : null;
        eventEndTime = event.tsTo ? event.tsTo : null;



        var eventCompletionStatus = "";
        console.log("---- test ----");
        console.log(startTs, endTs, eventCompletionStatus);
        console.log("---- test ----");
        if (eventStartTime > endTs) {
          eventCompletionStatus = "UPCOMING"
        }
        if (eventEndTime < startTs) {
          eventCompletionStatus = "COMPLETED"
        }
        if ((eventStartTime > startTs) && (eventStartTime < endTs)) {
          eventCompletionStatus = "TODAYS_EVENT"
        }

        //  eventStartTime = event.tsFrom ? moment.unix(event.tsFrom).format('hh:mm A , DD MMMM YYYY') : null;
        //  eventEndTime = event.tsTo ? moment.unix(event.tsTo).format('hh:mm A , DD MMMM YYYY') : null;
        console.log("---------after convertion-----------")
        console.log("eventDate : " + eventDate)
        console.log("eventStartTime : " + eventStartTime)
        console.log("eventEndTime : " + eventEndTime)
        var speakerType = null
        if (event.speakerTypeId) {
          speakerType = event.speakerTypeId.name;
        }

        var eventDetail = {
          
          id: id || null,
          title: event.title || null,
          description: event.description || null,
          amount: event.amount || null,
          image: event.image || null,
          lat: event.lat || null,
          lng: event.lng || null,
          venue: event.venue || null,
          eventDate: eventDate || null,
          eventFromTime: eventStartTime,
          eventToTime: eventEndTime,
          organizer: event.organizer || null,
          timeZone: event.timeZone || null,
          organizerEventsCount: eventsCount || null,
          sharingUrl: event.sharingUrl || null,
          isFav: event.isFav || null,
          speakerName: event.speakerName || null,
          speakerType,
          eventCompletionStatus,
          interestAssigned: interestAssigned || false,
          speakerTitle: event.speakerTitle || null,
          speakerOrganisation: event.speakerOrganisation || null,
          speakerImage: event.speakerImage || null,
          speakerDescription: event.speakerDescription || null,
          speakerVideoLinks: event.speakerVideoLinks || null,
          imageBase: eventsConfig.imageBase || null,
          organizerImageBase: eventsConfig.organizerImageBase || null,
          eventSpeakerImageBase: eventSpeakerConfig.imageBase || null,
          videoLink:event.videoLink,
          isBooked,
          isParticipated
        }

        res.send(eventDetail);
      });

    });

}

exports.sendEventBooking = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.body;
  if (
    // !params.name || !params.email || !params.phoneNumber || 
    !params.participateCount || !params.eventId) {
    errors = [];
    // if (!params.name) {
    //   errors.push({
    //     field: "name",
    //     message: "Name cannot be empty"
    //   });
    // }
    // if (!params.email) {
    //   errors.push({
    //     field: "email",
    //     message: "Email cannot be empty"
    //   });
    // }
    // if (!params.phoneNumber) {
    //   errors.push({
    //     field: "phoneNumber",
    //     message: "Phonenumber cannot be empty"
    //   });
    // }
    if (!params.participateCount) {
      errors.push({
        field: "participateCount",
        message: "participateCount cannot be empty"
      });
    }
    if (!params.eventId) {
      errors.push({
        field: "eventId",
        message: "eventId cannot be empty"
      });
    }
    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }
  var filters = {
    userId: userId,
    eventId: params.eventId,
    status: 1,
  }
  EventBooking.find(filters).then(result => {
    if (result.length > 0) {
      var responseErrorObj = {
        success: 0,
        status: 200,
        errors: [{
          field: "id",
          message: "userId already Booked the event"
        }]
      }
      res.send(responseErrorObj);
      return;
    }
    eventSubmit()
  })

  async function eventSubmit() {
    const newEvent = new EventBooking({
      userId: userId,
      name: params.name,
      email: params.email,
      phoneNumber: params.phoneNumber,
      participateCount: params.participateCount,
      eventId: params.eventId,
      isParticipated: false,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });

    //rakesh 
    const saveData = await newEvent.save().catch(err => {
      return {
        success: 0,
        message: err.message
      }
    });
    if (saveData && saveData && saveData.success === 0) {
      return res.send(saveData);
    }


    // var updateInfo = { $inc: { 'coinCount': constants.COIN_COUNT_EVENT_PARTICIPATE } };
    // const userUpdate = await User.updateOne({ _id: userId }, updateInfo).catch(err => {
    //   return {
    //     success: 0,
    //     message: err.message
    //   }
    // })
    // if (userUpdate && userUpdate.success && userUpdate.success === 0) {
    //   return res.send(userUpdate)
    // }
    // var coinUpdateObj = {
    //   coinType: constants.COIN_PARTICIPATE_EVENT,
    //   coinCount: constants.COIN_COUNT_EVENT_PARTICIPATE,
    //   coinDate: Date.now()
    // };
    // var updateInfo1 = { $push: { coinHistory: coinUpdateObj } };
    // const userUpdate1 = await User.updateOne({ _id: userId }, updateInfo1).catch(err => {
    //   return {
    //     success: 0,
    //     message: err.message
    //   }
    // })
    // if (userUpdate1 && userUpdate1.success && userUpdate1.success === 0) {
    //   return res.send(userUpdate1)
    // }
    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": userId }]

        var notificationObj = {
            title: "Booked your request for participating event",
            message: "you have booked for event",
            type: constants.EVENT_BOOKING,
            filtersJsonArr,
            // metaInfo,
            typeId: params.eventId,
            userId: userId,
            notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
        }
        let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
    return res.send({
      success: 1,
      message: "succesfully added booking"
    })
    // newEvent.save()
    //   .then(data => {
    //     var formattedData = {
    //       success: 1,
    //       message: "Eventbooking submitted"
    //     };
    //     res.send(formattedData);
    //   }).catch(err => {
    //     res.status(500).send({
    //       success: 0,
    //       status: 500,
    //       message: err.message || "Some error occurred while booking event."
    //     });
    //   });
  }
}

// *** Event history ***
exports.listEventHistory = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || eventsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : eventsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var findCriteria = {};

  if (params.tabType == constants.EVENT_HISTORY_DATA_BOOKED) {
    findCriteria.isBoked = true;
    findCriteria.isParticipated = false;
  }
  if (params.tabType == constants.EVENT_HISTORY_DATA_PARTITICPATED) {
    findCriteria.isBoked = true;
    findCriteria.isParticipated = true;
  }

  if ((params.tabType == "booked") || (params.tabType == "participated")) {

  }

  findCriteria.userId = userId;
  findCriteria.status = 1;


  var eventHistoryData = await EventBooking.find(findCriteria)
    .populate('eventId')
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while listing event history',
        error: err
      }
    })
  if (eventHistoryData && (eventHistoryData.success !== undefined) && (eventHistoryData.success === 0)) {
    return res.send(eventHistoryData);
  }

  let totalEventHistoryCount = await EventBooking.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting total event history count',
        error: err
      }
    })
  if (totalEventHistoryCount && totalEventHistoryCount.success && (totalEventHistoryCount.success === 0)) {
    return res.send(totalEventHistoryCount);
  }

  var totalPages = totalEventHistoryCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalEventHistoryCount,
    totalPages,
  };
  return res.send({
    success: 1,
    pagination,
    imageBase: eventsConfig.imageBase,
    items: eventHistoryData,
    message: 'event history list'
  })

}

exports.participateEvent1 = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var eventId = req.params.id;

  var findCriteria = {
    _id: eventId,
    status: 1
  }

  var eventCheck = await Event.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking event exists or not',
        error: err
      }
    })
  if (eventCheck && eventCheck.success && (eventCheck.success === 0)) {
    return res.send(eventCheck);
  }

}

exports.participateEvent = async (req, res) => {

  
  var userData = req.identity.data;
  var userId = userData.userId;

  var eventId = req.params.id;

  var findCriteria = {
    _id: eventId,
    status: 1
  }

  var eventCheck = await Event.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking event exists or not',
        error: err
      }
    })
  if (eventCheck && eventCheck.success && (eventCheck.success === 0)) {
    return res.send(eventCheck);
  }
  if (eventCheck) {
    findCriteria = {
      eventId,
      userId,
      status: 1
    }
    var checkEventBook = await EventBooking.findOne(findCriteria)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while event booked or not',
          error: err
        }
      })
    if (checkEventBook && checkEventBook.success && (checkEventBook.success === 0)) {
      return res.send(checkEventBook);
    }
    if (checkEventBook) {
      if (checkEventBook.isParticipated) {
        return res.send({
          success: 0,
          message: "Already participated"
        })
      } else {
        var update = {};
        update.isParticipated = true;
        update.tsModifiedAt = Date.now();

        var updateEventParticipate = await EventBooking.updateOne(findCriteria, update)
          .catch(err => {
            return {
              success: 0,
              message: 'Something went wrong while update event as participated',
              error: err
            }
          })
        if (updateEventParticipate && updateEventParticipate.success && (updateEventParticipate.success === 0)) {
          return res.send(updateEventParticipate);
        }

        var updateInfo = { $inc: { 'coinCount': constants.COIN_COUNT_EVENT_PARTICIPATE } };
        const userUpdate = await User.updateOne({ _id: userId }, updateInfo).catch(err => {
          return {
            success: 0,
            message: err.message
          }
        })
       
        if (userUpdate && userUpdate.success && userUpdate.success === 0) {
          return res.send(userUpdate)
        }
        var coinUpdateObj = {
          coinType: constants.COIN_PARTICIPATE_EVENT,
          coinCount: constants.COIN_COUNT_EVENT_PARTICIPATE,
          coinDate: Date.now()
        };
        var updateInfo1 = { $push: { coinHistory: coinUpdateObj } };
        const userUpdate1 = await User.updateOne({ _id: userId }, updateInfo1).catch(err => {
          return {
            success: 0,
            message: err.message
          }
        })
        if (userUpdate1 && userUpdate1.success && userUpdate1.success === 0) {
          return res.send(userUpdate1)
        }

        return res.send({
          success: 1,
          message: 'Event participated successfully'
        })
      }
    } else {
      return res.send({
        success: 0,
        message: "Event not booked"
      })
    }
  } else {
    return res.send({
      success: 0,
      message: "Event not exists"
    })
  }
}

exports.getEventLink = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  
  var eventId = req.params.id;
 
  var findCriteria = {
    _id: eventId,
    status: 1
  }
  var eventZoomLink = await Event.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting zoomlink',
        error: err
      }
    })
  if (eventZoomLink && eventZoomLink.success && (eventZoomLink.success === 0)) {
    return res.send(eventZoomLink);
  }
  if (eventZoomLink) {
    findCriteria = {
      userId,
      eventId,
      status: 1
    }
    var checkEventBookResp = await EventBooking.findOne(findCriteria)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking event booked or not',
          error: err
        }
      })
    if (checkEventBookResp && checkEventBookResp.success && (checkEventBookResp.success === 0)) {
      return res.send(checkEventBookResp);
    }
    if (checkEventBookResp) {


     
      var responseObj = {}
      if (eventZoomLink.zoomLink !== null && eventZoomLink.zoomLink !== undefined) {
        responseObj.success = 1;
        responseObj.link = eventZoomLink.zoomLink;
        responseObj.message = 'Event link';
      } else {
        responseObj.success = 0;
        responseObj.link = null;
        responseObj.message = 'Event link not generated';
      }
      return res.send(responseObj)

    } else {
      return res.send({
        success: 0,
        message: "Event not booked"
      })
    }

  } else {
    return res.send({
      success: 0,
      message: "Invalid event"
    })
  }
}

exports.getEventScholarshipPlacementList = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;



  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || eventsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : eventsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var endTs = await getEndTsToday();

  var findCriteria = {
    tsTo: {
      $gte: endTs
    }
  }

  findCriteria.status = 1;

  var projection = {
    title: 1,
    image: 1,
    description: 1,
    tsFrom: 1,
    tsTo: 1,
    isStudent: 1,
    venue: 1
  }

  var scholarshipOrPlacementList = await ScholarshipOrPlacement.find(findCriteria, projection)
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while listing scholarship Or placement',
        error: err
      }
    })
  if (scholarshipOrPlacementList && (scholarshipOrPlacementList.success !== undefined) && (scholarshipOrPlacementList.success === 0)) {
    return res.send(scholarshipOrPlacementList);
  }

  let totalScholarshipOrPlacementCount = await ScholarshipOrPlacement.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting total total scholarship or placement count',
        error: err
      }
    })
  if (totalScholarshipOrPlacementCount && totalScholarshipOrPlacementCount.success && (totalScholarshipOrPlacementCount.success === 0)) {
    return res.send(totalScholarshipOrPlacementCount);
  }

  var totalPages = totalScholarshipOrPlacementCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalScholarshipOrPlacementCount,
    totalPages,
  };

  scholarshipOrPlacementList = JSON.parse(JSON.stringify(scholarshipOrPlacementList));
  scholarshipOrPlacementListObj = await checkAndUpdateIsAppliedField(userId, scholarshipOrPlacementList)
  if (scholarshipOrPlacementListObj && (scholarshipOrPlacementListObj.success !== undefined) && (scholarshipOrPlacementListObj.success === 0)) {
    return res.send(scholarshipOrPlacementListObj);
  }
  return res.send({
    success: 1,
    pagination,
    imageBase: eventsConfig.imageBase,
    items: scholarshipOrPlacementListObj.list,
    message: 'scholarship or placement list'
  })
}

exports.getEventScholarshipPlacementDetail = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;
  var eventScholarshipPlacementId = req.params.id;

  var findCriteria = {
    _id: eventScholarshipPlacementId,
    status: 1
  }
  var projection = {
    title: 1,
    image: 1,
    description: 1,
    tsFrom: 1,
    tsTo: 1,
    isStudent: 1,
    venue: 1
  }
  var checkEventScholarshipPlacement = await ScholarshipOrPlacement.findOne(findCriteria, projection)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get details of scholarship orplacement',
        error: err
      }
    })
  if (checkEventScholarshipPlacement && (checkEventScholarshipPlacement.success !== undefined) && (checkEventScholarshipPlacement.success === 0)) {
    return res.send(checkEventScholarshipPlacement);
  }
  if (checkEventScholarshipPlacement) {
    var isApplied = false;
    findCriteria = {
      userId,
      scholarshipOrPlacementId: eventScholarshipPlacementId,
      status: 1
    }
    var checkApplied = await ScholarshipOrPlacementRequest.findOne(findCriteria)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking scholarship or placement applied or not',
          error: err
        }
      })
    if (checkApplied && (checkApplied.success !== undefined) && (checkApplied.success === 0)) {
      return res.send(checkApplied);
    }
    if (checkApplied) {
      isApplied = true;
    }

    const fromDate = moment.unix(checkEventScholarshipPlacement.tsFrom).format("MMM DD YYYY");
    const toDate = moment.unix(checkEventScholarshipPlacement.tsTo).format("MMM DD YYYY");
    const duration = fromDate + "- " + toDate;

    return res.send({
      success: 1,
      item: checkEventScholarshipPlacement,
      isApplied,
      duration: duration || "duration not available",
      imageBase: eventsConfig.imageBase,
      message: 'Scholaship or placement details'
    })
  } else {
    return res.send({
      success: 0,
      message: "Scholaship or placement not exists"
    })
  }
}

exports.applyEventScholarshipPlacement = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;
  var eventScholarshipPlacementId = req.params.id;
  var params = req.body;

  var findCriteria = {
    _id: eventScholarshipPlacementId,
    status: 1
  }
  var projection = {
    title: 1,
    image: 1,
    description: 1,
    tsFrom: 1,
    tsTo: 1,
    isStudent: 1,
    venue: 1
  }
  var checkEventScholarshipPlacement = await ScholarshipOrPlacement.findOne(findCriteria, projection)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get details of scholarship orplacement',
        error: err
      }
    })
  if (checkEventScholarshipPlacement && (checkEventScholarshipPlacement.success !== undefined) && (checkEventScholarshipPlacement.success === 0)) {
    return res.send(checkEventScholarshipPlacement);
  }
  if (checkEventScholarshipPlacement) {

    findCriteria = {
      scholarshipOrPlacementId: eventScholarshipPlacementId,
      userId,
      status: 1
    }
    var checkAlreadyApplied = await ScholarshipOrPlacementRequest.findOne(findCriteria)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking already applied for scholarship or placement',
          error: err
        }
      })
    if (checkAlreadyApplied && (checkAlreadyApplied.success !== undefined) && (checkAlreadyApplied.success === 0)) {
      return res.send(checkAlreadyApplied);
    }

    if (checkAlreadyApplied) {
      var alreadyExistsMessage = ''

      if (checkEventScholarshipPlacement.isStudent) {
        alreadyExistsMessage = 'Already applied for this scholarship'
      } else {
        alreadyExistsMessage = 'Already applied for this placement'
      }
      return res.send({
        success: 0,
        message: alreadyExistsMessage
      })
    } else {
      var message = '';
      var eventScholarshipPlacementObj = {};
      eventScholarshipPlacementObj.userId = userId;
      eventScholarshipPlacementObj.scholarshipOrPlacementId = eventScholarshipPlacementId;
      eventScholarshipPlacementObj.isStudent = checkEventScholarshipPlacement.isStudent;


      if (checkEventScholarshipPlacement.isStudent) {
        if (!params.courceDoing || !params.previousClassDetails || !params.subjectWithGrades) {
          var errors = [];
          if (!params.courceDoing) {
            errors.push({
              field: "courceDoing",
              message: "courceDoing id missing"
            });
          }
          if (!params.previousClassDetails) {
            errors.push({
              field: "previousClassDetails",
              message: "previousClassDetails id missing"
            });
          }
          if (!params.subjectWithGrades) {
            errors.push({
              field: "subjectWithGrades",
              message: "subjectWithGrades id missing"
            });
          }
          return res.send({
            success: 0,
            errors: errors,
            code: 200
          });
        }
        eventScholarshipPlacementObj.courceDoing = params.courceDoing;
        eventScholarshipPlacementObj.previousClassDetails = params.previousClassDetails;
        eventScholarshipPlacementObj.subjectWithGrades = params.subjectWithGrades;
        message = 'You applied scholarship successfully'
      } else {
        if (!params.higherEducation || !params.projectBrief || !params.subjectWithGrades) {
          var errors = [];
          if (!params.higherEducation) {
            errors.push({
              field: "higherEducation",
              message: "higherEducation id missing"
            });
          }
          if (!params.projectBrief) {
            errors.push({
              field: "projectBrief",
              message: "projectBrief id missing"
            });
          }
          if (!params.subjectWithGrades) {
            errors.push({
              field: "subjectWithGrades",
              message: "subjectWithGrades id missing"
            });
          }
          return res.send({
            success: 0,
            errors: errors,
            code: 200
          });
        }
        eventScholarshipPlacementObj.higherEducation = params.higherEducation;
        eventScholarshipPlacementObj.projectBrief = params.projectBrief;
        eventScholarshipPlacementObj.subjectWithGrades = params.subjectWithGrades;
        message = 'You applied for placement successfully'
      }
      eventScholarshipPlacementObj.status = 1;
      eventScholarshipPlacementObj.tsCreatedAt = Date.now();
      eventScholarshipPlacementObj.tsModifiedAt = null;

      var newEventScholarshipPlacement = new ScholarshipOrPlacementRequest(eventScholarshipPlacementObj);
      var newEventScholarshipPlacementRequest = await newEventScholarshipPlacement.save()
        .catch(err => {
          return {
            success: 0,
            message: 'Something went wrong while saving scholarship or placement request',
            error: err
          }
        })
      if (newEventScholarshipPlacementRequest && (newEventScholarshipPlacementRequest.success !== undefined) && (newEventScholarshipPlacementRequest.success === 0)) {
        return res.send(newEventScholarshipPlacementRequest);
      }
      return res.send({
        success: 1,
        message
      })

    }

  } else {
    return res.send({
      success: 0,
      message: "Scholaship or placement not exists"
    })
  }
}

async function getStartTsToday() {
  var now = new Date();
  var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var timestamp = startOfDay / 1000;
  console.log("timestamp : " + timestamp);
  return timestamp;
}
async function getEndTsToday() {
  var now = new Date();
  var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var timestamp = startOfDay / 1000;
  var endTimestamp = timestamp + 24 * 60 * 60 - 1
  console.log("endTimestamp : " + endTimestamp);
  return endTimestamp;
}

// add interest 

exports.addInterest = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;
  var eventId = req.params.id;

  var event = await Event.find({ status: 1, _id: eventId }).catch(err => {
    return { success: 0, message: "some thing went wrong while fetching database" };
  })
  if (event && (event.success != undefined) && event.success == 0) {
    return res.send(event);
  }

  console.log(event, event.success)
  if (event.length === 0) {
    return res.send({
      success: 0,
      message: "this event does not exist"
    })
  }

  var interestCount = await eventUserInterest.countDocuments({ status: 1, userId: userId, eventId: eventId }).catch(err => {
    return { success: 0, message: "could not count document" }
  });


  console.log(interestCount)
  if (interestCount && (interestCount.success != undefined) && interestCount.success === 0) {
    return res.send(interestCount);
  }

  if (interestCount > 0) {
    return res.send({ success: 0, message: "already assigned your interest" })
  }

  var update = await Event.updateOne({ status: 1, _id: eventId }, { $inc: { interestedCount: 1 } }).catch(err => {
    return { success: 0, message: err.message };
  })


  if (update && (update.success != undefined) && update.success === 0) {
    return res.send(update);
  }

  const newInterest = new eventUserInterest({
    userId: userId,
    eventId: eventId,
    status: 1,
    tsCreatedAt: Date.now(),
    tsModifiedAt: null
  });

  var insert = await newInterest.save().catch(err => {
    return { success: 0, message: "could not insert data" }
  });

  if (insert && (insert.success != undefined) && insert.success === 0) {
    return res.send(insert);
  }

  return res.send({
    success: 1,
    message: "updated interest count"
  })

}


async function checkAndUpdateIsAppliedField(userId, scholarshipOrPlacementList) {
  if (scholarshipOrPlacementList.length > 0) {
    var yourScholarshipOrPlacementData = await ScholarshipOrPlacementRequest.find({
      userId,
      status: 1
    }, {
      scholarshipOrPlacementId: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting applied scholarships or payments',
          error: err
        }
      })
    if (yourScholarshipOrPlacementData && (yourScholarshipOrPlacementData.success !== undefined) && (yourScholarshipOrPlacementData.success === 0)) {
      return yourScholarshipOrPlacementData;
    }
    if (yourScholarshipOrPlacementData.length > 0) {
      for (let i = 0; i < scholarshipOrPlacementList.length; i++) {
        var scoloarOrPlacmentObj = scholarshipOrPlacementList[i];
        var checkIndex = await yourScholarshipOrPlacementData.findIndex(obj => (JSON.stringify(obj.scholarshipOrPlacementId) === JSON.stringify(scoloarOrPlacmentObj.id)))
        if (checkIndex > -1) {
          scholarshipOrPlacementList[i].isApplied = true;
        } else {
          scholarshipOrPlacementList[i].isApplied = false;
        }
      }
      return {
        success: 1,
        list: scholarshipOrPlacementList,
        message: 'Applied list'
      }
    } else {
      for (let i = 0; i < scholarshipOrPlacementList.length; i++) {
        scholarshipOrPlacementList[i].isApplied = false;
      }
      return {
        success: 1,
        list: scholarshipOrPlacementList,
        message: 'Nothing applied'
      }
    }
  } else {
    return {
      success: 1,
      list: scholarshipOrPlacementList,
      message: 'Empty list'
    }
  }
}




var CronJob = require('cron').CronJob;

var job = new CronJob(' 0 06 * * *', async function () {

  var x1 = Date.now();
  var x2 = x1 + (1000 * 60 * 60 * 24);

  var thisMoment = x1 / 1000;
  var tomorrow = x2 / 1000;

  var filter = {};
  filter.tsFrom = { $gt: thisMoment };
  filter.status = 1;
  filter.tsFrom = { $lt: tomorrow };

  var eves = await Event.find(filter).catch(err => {
    return { success: 0, message: err.message };
  })

  if (eves && eves.success != undefined && eves.success === 0) {
    return
  }

  const eveIds = eves.map(eve => eve._id);

  var filter1 = {};
  filter1.eventId = { $in: eveIds };

  const bookings = await EventBooking.find(filter1).catch(err => {
    return { success: 0, message: err.message };
  })

  if (bookings && bookings.success != undefined && bookings.success === 0) {
    return
  }

  const users = bookings.map(booking => booking.userId);

  for (y in users) {

    var user = users[y];
    var owner = user;

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
      title: " Today's Event",
      message: "You have booked an event, don't forget to join!",
      type: constants.ALUMNI_EVENT_PARTICIPATION,
      filtersJsonArr,
      // metaInfo,
      // typeId: event._id,
      userId: owner,
      notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
  }



}, null, true, 'Asia/Kolkata');
job.start();

var job1 = new CronJob(' 0 06 * * *', async function () {

  var x1 = Date.now();
  var x2 = x1 - (1000 * 60 * 60 * 24);

  var thisMoment = x1 / 1000;
  var yesterday = x2 / 1000;

  var filter = {};
  filter.tsTo = { $lt: thisMoment };
  filter.status = 1;
  filter.tsTo = { $gt: yesterday };

  var eves = await Event.find(filter).catch(err => {
    return { success: 0, message: err.message };
  })

  if (eves && eves.success != undefined && eves.success === 0) {
    return
  }

  const eveIds = eves.map(eve => eve._id);

  var filter1 = {};
  filter1.eventId = { $in: eveIds };
  filter1.isParticipated = true;

  const bookings = await EventBooking.find(filter1).catch(err => {
    return { success: 0, message: err.message };
  })

  if (bookings && bookings.success != undefined && bookings.success === 0) {
    return
  }

  const users = bookings.map(booking => booking.userId);

  for (y in users) {

    var user = users[y];
    var owner = user;

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
      title: " Yesterday's Event",
      message: "Thanks for participating yesterday's event",
      type: constants.ALUMNI_EVENT_PARTICIPATION,
      filtersJsonArr,
      // metaInfo,
      // typeId: event._id,
      userId: owner,
      notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
  }



}, null, true, 'Asia/Kolkata');
job1.start();

var job2 = new CronJob(' 10 * * * * *', async function () {

  var x1 = Date.now();
  var x2 = x1 - (1000 * 60 * 60 * 24);

  var thisMoment = x1 / 1000;
  var yesterday = x2 / 1000;

  var filter = {};
  filter.tsTo = { $lt: thisMoment };
  filter.status = 1;
  filter.tsTo = { $gt: yesterday };

  var eves = await Event.find(filter).catch(err => {
    return { success: 0, message: err.message };
  })

  if (eves && eves.success != undefined && eves.success === 0) {
    return
  }

  const eveIds = eves.map(eve => eve._id);

  console.log(eveIds);
  var filter1 = {};
  filter1.eventId = { $in: eveIds };
  filter1.isParticipated = false;

  const bookings = await EventBooking.find(filter1).catch(err => {
    return { success: 0, message: err.message };
  })

  if (bookings && bookings.success != undefined && bookings.success === 0) {
    return
  }

  const users = bookings.map(booking => booking.userId);

  for (y in users) {

    var user = users[y];
    var owner = user;

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
      title: "Yesterday's Event",
      message: "You have missed yesterday event",
      type: constants.ALUMNI_EVENT_PARTICIPATION,
      filtersJsonArr,
      // metaInfo,
      // typeId: event._id,
      userId: owner,
      notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
   // let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
  }



}, null, true, 'Asia/Kolkata');
job2.start();

var job3 = new CronJob(' 0 07 * * *', async function () {

  var x1 = Date.now();
  var x2 = x1 + (1000 * 60 * 60 * 24);
  var x3 = x1 + (1000 * 60 * 60 * 48);
  var thisMoment = x2 / 1000;
  var tomorrow = x3 / 1000;

  var filter = {};
  filter.tsFrom = { $gt: thisMoment };
  filter.status = 1;
  filter.tsFrom = { $lt: tomorrow };

  var eves = await Event.find(filter).catch(err => {
    return { success: 0, message: err.message };
  })

  if (eves && eves.success != undefined && eves.success === 0) {
    return
  }

  const eveIds = eves.map(eve => eve._id);

  var filter1 = {};
  filter1.eventId = { $in: eveIds };

  const bookings = await EventBooking.find(filter1).catch(err => {
    return { success: 0, message: err.message };
  })

  if (bookings && bookings.success != undefined && bookings.success === 0) {
    return
  }

  const users = bookings.map(booking => booking.userId);

  for (y in users) {

    var user = users[y];
    var owner = user;

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
      title: " Tomorrow's Event",
      message: "You have booked an event, don't forget to join!",
      type: constants.ALUMNI_EVENT_PARTICIPATION,
      filtersJsonArr,
      // metaInfo,
      // typeId: event._id,
      userId: owner,
      notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
  }



}, null, true, 'Asia/Kolkata');
job3.start();