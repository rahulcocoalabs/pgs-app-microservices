var moment = require('moment');
var gateway = require('../components/gateway.component.js');
const Event = require('../models/event.model.js');
const User = require('../models/user.model.js');
const EventBooking = require('../models/eventBooking.model.js')
const SpeakerType = require('../models/speakerType.model')
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants.js');
var eventsConfig = config.events;
var eventSpeakerConfig = config.eventSpeaker;
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
    category: 1
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
  }

  filters.status = 1;
  Event.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['category']).then(eventsList => {
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
        totalPages: totalPages
      }

      res.send(responseObj);
    });

  });
}

exports.getDetail = (req, res) => {
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
    tsTo: 1,
    eventOrganizerId: 1,
    organizer: 1,
    isFav: 1,
    speakerName: 1,
    speakerTypeId: 1,
    speakerTitle: 1,
    speakerOrganisation: 1,
    speakerImage: 1,
    speakerDescription: 1,
    speakerVideoLinks: 1
  }
  // get data
  Event.findOne(filters, queryProjection)
    .populate([{
      path: 'organizer',
    }, {
      path: 'speakerTypeId',
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
          organizerEventsCount: eventsCount || null,
          sharingUrl: event.sharingUrl || null,
          isFav: event.isFav || null,
          speakerName: event.speakerName || null,
          speakerType,
          speakerTitle: event.speakerTitle || null,
          speakerOrganisation: event.speakerOrganisation || null,
          speakerImage: event.speakerImage || null,
          speakerDescription: event.speakerDescription || null,
          speakerVideoLinks: event.speakerVideoLinks || null,
          imageBase: eventsConfig.imageBase || null,
          organizerImageBase: eventsConfig.organizerImageBase || null,
          eventSpeakerImageBase: eventSpeakerConfig.imageBase || null
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
  // EventBooking.find(filters).then(result => {
  //   if (result.length > 0) {
  //     var responseErrorObj = {
  //       success: 0,
  //       status: 200,
  //       errors: [{
  //         field: "id",
  //         message: "userId already Booked the event"
  //       }]
  //     }
  //     res.send(responseErrorObj);
  //     return;
  //   }
  //   eventSubmit()
  // })

  // function eventSubmit() {
  const newEvent = new EventBooking({
    userId: userId,
    name: params.name,
    email: params.email,
    phoneNumber: params.phoneNumber,
    participateCount: params.participateCount,
    eventId: params.eventId,
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

 
  var updateInfo = {$inc : {'coinCount' : constants.COIN_COUNT_EVENT_PARTICIPATE}};
  const userUpdate = await User.updateOne({_id:userId},updateInfo).catch(err=>{
    return {
      success:0,
      message:err.message
    }
  })
  if (userUpdate && userUpdate.success && userUpdate.success === 0){
    return res.send(userUpdate)
  }
  var coinUpdateObj = {
    coinType:constants.COIN_PARTICIPATE_EVENT,
    coinCount:constants.COIN_COUNT_EVENT_PARTICIPATE,
    coinDate:Date.now()
  };
  var updateInfo1 = {$push : {coinHistory:coinUpdateObj}};
  const userUpdate1 = await User.updateOne({_id:userId},updateInfo1).catch(err=>{
    return {
      success:0,
      message:err.message
    }
  })
  if (userUpdate1 && userUpdate1.success && userUpdate1.success === 0){
    return res.send(userUpdate1)
  }
  return res.send({
    success:1,
    message:"succesfully added booking"
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
  // }
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

  var findCriteria = {
    userId,
    status: 1,
  }

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