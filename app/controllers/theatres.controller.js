const Theatre = require('../models/theatre.model.js');
const TheatreMovie = require('../models/theatreMovie.model.js');
const TheatreScreens = require('../models/theatreScreen.model.js');
const TheatreScreenSeats = require('../models/theatreScreenSeat.model.js');
const TheatreScreenSeatBooking = require('../models/theatreScreenSeatBooking.model');
const TheatreSeatLocking = require('../models/theatreSeatLocking.model.js');
const constants = require("../helpers/constants")
var config = require('../../config/app.config.js');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
function theatresController(methods, options) {

this.theatreList = (req, res) => {
  var params = req.query;
  var showDate = params.showDate;
  var latitude = params.latitude;
  var longitude = params.longitude;
  var movieId = params.movieId;
  var i;
  if (!showDate || !movieId) {
    errors = [];
    if (!showDate) {
      errors.push({
        field: "showDate",
        message: "showDate cannot be empty"
      });
    }
    if (!movieId) {
      errors.push({
        field: "movieId",
        message: "movieId cannot be empty"
      });
    }
    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }
  var filters = {
    $match: {

    }
  };
  var hasFilters = false;
  var aggregateArray = [];
  if (movieId) {
    hasFilters = true;
    filters.$match.movieId = require('mongoose').Types.ObjectId(movieId);
  }
  // if(showDate){
  //   hasFilters = true;
  //   filters.$match.showDate = showDate;
  // }

  if (hasFilters) {
    aggregateArray.push(filters);
  }

  var conditions = [{
      $lookup: {
        from: 'Theatres',
        localField: 'theatreId',
        foreignField: '_id',
        as: 'theatre'
      }
    },
    {
      $lookup: {
        from: 'TheatreScreens',
        localField: 'theatreScreenId',
        foreignField: '_id',
        as: 'theatreScreens'
      }
    },
    {
      $unwind: "$theatre"
    },
    {
      $unwind: "$theatreScreens"
    }
  ];
  aggregateArray = aggregateArray.concat(conditions);
  TheatreMovie.aggregate(aggregateArray).then(result => {
    var ret = {};
    var record = null;
    var theatre = null;
    var item = null;
    var theatreScreen = null;
    var theatreId;
    var theatreScreenId;
    var theatreScreenName;
    var timing = {};
    for (i = 0; i < result.length; i++) {
      record = result[i];
      if (record.theatre) {

        theatre = record.theatre;
        theatreId = theatre._id;
        if (!ret[theatreId]) {
          item = {};
          item.id = theatre._id;
          item.description = theatre.description;
          item.location = {
            name: theatre.name,
            lat: theatre.lat,
            lng: theatre.lng
          };
          item.timings = [];
          item.timingIds = {};

          ret[theatreId] = item;

        }
        timing = {};
        if (record.theatreScreens) {
          theatreScreen = record.theatreScreens;
          theatreScreenId = theatreScreen._id;
          theatreScreenName = theatreScreen.name;
          timing.id = theatreScreenId;
          if (ret[theatreId].timingIds[timing.id]) {
            continue;
          }
          timing.name = theatreScreenName;
          timing.startTime = record.showStartTime;
          timing.endTime = record.showEndTime;
          ret[theatreId].timingIds[timing.id] = 1;
          ret[theatreId].timings.push(timing);
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
    ret = Object.values(ret);
    res.send({
      success: 1,
      items: ret
    })
  }).catch(err => {
    res.send({
      success: 0,
      message: err.message || "Some error occurred while fetching theatre list"
    });
  });

}

this.seatAvailability = async (req, res) => {
  let theatreId = req.body.theatreId;
  let theatreScreenId = req.body.screenId;
  let theatreShowTypeId = req.body.theatreShowTypeId;
  let showDate = req.body.showDate;
  let updatedSeats;

  let filter = {
    theatreId,
    theatreScreenId,
  }
  let totalSeatsArray = await TheatreScreenSeats.find(filter).lean();

  if (totalSeatsArray.length > 0) {
    let seatIds = []

    for (let i = 0; i < totalSeatsArray.length; i++) {
      let item = totalSeatsArray[i];
      totalSeatsArray[i].seatStatus = constants.AVAILABLE_STATUS;
      seatIds.push(item._id);
    }
    filter = {
      seatId: {
        $in: seatIds
      },
      showDate: showDate,
      theatreShowTypeId: theatreShowTypeId
    }

    let lockBlockLockSeats = await TheatreSeatLocking.find(filter).lean();
    updatedSeats = await getLockBookAvailableSeats(totalSeatsArray, lockBlockLockSeats)
    res.send({
      success: 1,
      items: updatedSeats
    });
  }
}

this.seatLock = (req, res) => {
  let lockData = req.body;

  var seatArray = req.body.seats;
  var theatreShowTypeId = req.body.theatreShowTypeId;
  var userId = req.body.userId;
  var showDate = req.body.showDate;
  var screenId = req.body.screenId;
  var theatreId = req.body.theatreId;
  var movieId = req.body.movieId;
  lockSeats(lockData, function (result) {
    res.send({
      success: 1,
      result: result
    })
  });

}

this.bookMovie = async (req, res) => {
  let seatsData = req.body;
  var seatArrayTemp = req.body.seats;
  let seatArray = [];
  seatArray = seatArrayTemp.map(s => require('mongoose').Types.ObjectId(s));
  var theatreId = req.body.theatreId;
  var screenId = req.body.screenId;
  var movieId = req.body.movieId;
  var theatreShowTypeId = req.body.theatreShowTypeId;
  var userId = req.body.userId;
  var showDate = req.body.showDate;

  isBookingPossible(seatsData, function (status, seatLockIds) {
    if (status == true) {
      let bookingData = {
        theatreSeatIds: seatArray,
        theatreId,
        screenId,
        theatreShowTypeId,
        movieId,
        showDate,
        bookedUserId: userId,
        showDate,
        isBooked: true,
        tsCreatedAt: Number(moment().unix())
      }

      let theatreScreenSeatBookingData = new TheatreScreenSeatBooking(bookingData);
      theatreScreenSeatBookingData.save(async (err, user) => {
        let status = await setLookedSeatsBooked(seatLockIds);
        res.send({
          success: 1,
          status
        })
      });
    } else {
      res.send({
        success: 1,
        status: false
      })
    }
  });

}
}
module.exports = theatresController;

async function getSeatsStatus(seatData, userId, callback) {
  var lockedTill;
  var currentTimeStamp = Number(moment().unix());
  var status = constants.AVAILABLE_STATUS;
  let seatArrayTemp = [];
  let seatArray = [];
  seatArrayTemp = seatData.seats;
  seatArray = seatArrayTemp.map(s => require('mongoose').Types.ObjectId(s));
  var filter = {
    seatId: {
      $in: seatArray
    },
    showDate: seatData.showDate,
    theatreShowTypeId: seatData.theatreShowTypeId
  }

  let seatsList = await TheatreSeatLocking.find(filter).lean();
  let seatsListCount = seatsList.length;
  let i = 0;
  let seatLockIds = [];
  if (seatsList.length > 0) {
    await Promise.all(seatsList.map(async (seat) => {
      i = i + 1;
      lockedTill = seat.lockedTillTs;

      if (seat.status === constants.BOOKED_STATUS) {
        status = constants.BOOKED_STATUS;
        return;
      }
      if (lockedTill && (lockedTill >= currentTimeStamp)) {
        if (JSON.stringify(seat.userIdLockedBy) != JSON.stringify(ObjectId(userId))) {
          status = constants.LOCKED_STATUS;
          return;
        } else {
          seatLockIds.push(seat._id);
          if (seatsListCount === i) {
            status = constants.USER_LOCKED_STATUS;
            return;
          }
        }
      } else {
        status = constants.TIME_OUT_STATUS;
        return;
      }
    }))
  } else {
    status = constants.NO_LOCKED_STATUS;
  }

  callback(status, seatLockIds);

}

function isBookingPossible(seatsData, callback) {
  let seatArray = seatsData.seats;
  let userId = seatsData.userId;
  getSeatsStatus(seatsData, userId, function (status, seatLockIds) {
    if (status == constants.BOOKED_STATUS) {
      callback(false);
      return
    } else if (status == constants.LOCKED_STATUS) {
      callback(false);
    } else if (status == constants.NO_LOCKED_STATUS) {
      callback(false);
    } else if (status == constants.TIME_OUT_STATUS) {
      callback(false);
    } else if (status == constants.USER_LOCKED_STATUS) {
      callback(true, seatLockIds);
    } else if (status == constants.AVAILABLE_STATUS) {
      callback(true, seatLockIds);
      return;
    }
  })
}
async function setLookedSeatsBooked(seatLockIdsTemp) {
  let seatLockIds = seatLockIdsTemp.map(s => require('mongoose').Types.ObjectId(s));
  try {
    await TheatreSeatLocking.updateMany({
      _id: {
        $in: seatLockIds
      }
    }, {
      status: constants.BOOKED_STATUS
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }

};

async function getLockBookAvailableSeats(totalSeatsArray, lockBlockLockSeats) {
  let k = 0;
  var currentTimeStamp = Number(moment().unix());
  for (let i = 0; i < lockBlockLockSeats.length; i++) {
    let lockBlockSeat = lockBlockLockSeats[i];
    for (let j = 0; j < totalSeatsArray.length; j++) {
      let seat = totalSeatsArray[j];
      if (JSON.stringify(seat._id) === JSON.stringify(ObjectId(lockBlockSeat.seatId))) {
        let lockedTill = lockBlockSeat.lockedTillTs;
        if (lockBlockSeat.status === constants.BOOKED_STATUS) {
          seat.seatStatus = constants.BOOKED_STATUS;
          totalSeatsArray[j] = seat;
        } else if (lockedTill && (lockedTill >= currentTimeStamp)) {
          seat.seatStatus = constants.LOCKED_STATUS;
          totalSeatsArray[j] = seat;
        } else {
          seat.seatStatus = constants.AVAILABLE_STATUS;
          totalSeatsArray[j] = seat;
        }

        k = k + 1;
        if (i !== 0) {
          break;
        }
      }
    }
  }
  return totalSeatsArray;
}


function lockSeats(lockData, callback, index, result) {
  let seatArray = lockData.seats;
  index = index ? index : 0;
  result = result ? result : {};
  if (!seatArray[index]) {
    callback(result);
    return;
  }
  seatId = seatArray[index];
  index = index + 1;
  getSeatStatus(seatId, lockData, function (status) {
    if (status == constants.AVAILABLE_STATUS) {
      lockSeat(seatId, lockData, function (seatStatus) {
        result[seatId] = seatStatus ? 1 : 0;
        lockSeats(lockData, callback, index, result);
      });
    } else {
      result[seatId] = 0;
      lockSeats(lockData, callback, index, result);
    }
  });

}

function fillSeatStaus(data, callback, index, result) {
  index = index ? index : 0;
  result ? result : {};
  if (!data[index]) {
    callback(result);
    return;
  }
  screenSeatId = data[index]._id;
  screenSeat = data[index];

  getSeatStatus(screenSeatId, function (status) {
    data[index].seatStatus = status;
    index++;
    fillSeatStaus(data, callback, index, result)
  })

}


function lockSeat(seatId, lockData, callback) {
  var lockingPeriodMinutes = config.theatre.seatLockingMinutes ? config.theatre.seatLockingMinutes : 5;
  // var lockingPeriodMinutes = 1;

  let theatreShowTypeId = lockData.theatreShowTypeId;
  let userId = lockData.userId;
  let showDate = lockData.showDate;
  let screenId = lockData.screenId;
  let theatreId = lockData.theatreId
  let movieId = lockData.movieId;

  var filter = {
    seatId,
    theatreShowTypeId,
    showDate
  };

  var lockedTillTs;
  TheatreSeatLocking.findOne(filter).then(async result => {
    if (result == null) {
      var currentTs = Number(moment().unix());
      var lockingPeriodSeconds = lockingPeriodMinutes * 60;
      var lockedTill = currentTs + lockingPeriodSeconds;
      let insertData = {
        seatId,
        theatreShowTypeId,
        userIdLockedBy: userId,
        showDate,
        screenId,
        theatreId,
        movieId,
        status: constants.LOCKED_STATUS,
        lockedTillTs: lockedTill,
        tsCreatedAt: Number(moment().unix())
      }
      let newLock = new TheatreSeatLocking(insertData)
      newLock.save(async (err, user) => {
        callback(true);
      });
      // callback(false);
      // return;
    } else {
      lockedTillTs = result.lockedTillTs ? result.lockedTillTs : 0;
      var currentTs = Number(moment().unix());
      var lockingPeriodSeconds = lockingPeriodMinutes * 60;
      var lockedTill = currentTs + lockingPeriodSeconds;
      var updateData = {
        lockedTillTs: lockedTill,
        userIdLockedBy: userId,
        _id: result._id,
        status: constants.LOCKED_STATUS,
      };
      var theatreSeatLockData = await TheatreSeatLocking.findById(result._id);
      theatreSeatLockData.set(updateData);
      theatreSeatLockData.save(async (err, user) => {
        callback(true);
      });

    }
  })

}


function getSeatStatus(seatId, lockData, callback) {
  var lockedTill;
  let theatreShowTypeId = lockData.theatreShowTypeId;
  let userId = lockData.userId;
  let showDate = lockData.showDate;

  var currentTimeStamp = Number(moment().unix());
  var status = constants.AVAILABLE_STATUS;
  var isAvailable;
  var filter = {
    seatId: require('mongoose').Types.ObjectId(seatId),
    theatreShowTypeId: theatreShowTypeId,
    showDate: showDate
  }
  TheatreSeatLocking.findOne(filter).then(result => {
    if (result) {
      if (result.lockedTillTs && (result.lockedTillTs >= currentTimeStamp)) {
        status = constants.LOCKED_STATUS;
        callback(status);
        return;
      } else {
        if (result.status && result.status === constants.BOOKED_STATUS) {
          status = constants.BOOKED_STATUS;
        }
        callback(status);
        return;
        // var filterSeats = {
        //   theatreScreenSeatId: require('mongoose').Types.ObjectId(seatId),
        //   startTimeTs: {
        //     $gte: currentTimeStamp,
        //   },
        //   endTimeTs: {
        //     $lte: currentTimeStamp
        //   }
        // };
        // TheatreScreenSeatBooking.find(filterSeats).then(result => {
        //   if (result.length != 0) {
        //     status = 'booked';
        //   }
        //   callback(status);
        // })
      }
    } else {
      callback(status);
    }
  })

}


