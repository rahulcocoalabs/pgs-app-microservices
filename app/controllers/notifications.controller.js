
  const Notification = require('../models/notification.model.js');
  const MarkasRead = require('../models/notificationStatus.model.js');
  var config = require('../../config/app.config.js');
  var moment = require('moment');
const constants = require('../helpers/constants.js');
  var notificationsConfig = config.notifications;

  exports.listAll = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || notificationsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : notificationsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    var findCriteria = {
       $or:[
          {userId:userId},
          {notificationType:constants.GENERAL_NOTIFICATION_TYPE}
          ]
    }
    findCriteria.status = 1;
    var queryProjection = {
      title: 1,
      content: 1,
      type : 1,
      referenceId : 1,
      notificationType : 1,
      userId : 1,
      markAsRead : 1,
      userId : 1,
    };
    var notificationListData = await Notification.find(findCriteria, queryProjection)
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting notifications',
        error: err
      }
    })
  if (notificationListData && (notificationListData.success !== undefined) && (notificationListData.success === 0)) {
    return notificationListData;
  }

  var notificationCount = await Notification.count(findCriteria)
  .limit(perPage)
  .skip(offset)
  .sort({
    'tsCreatedAt': -1
  }).catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while getting notification count',
      error: err
    }
  })
if (notificationCount && (notificationCount.success !== undefined) && (notificationCount.success === 0)) {
  return notificationCount;
}

notificationListData = JSON.parse(JSON.stringify(notificationListData))
notificationListData = await checkAndUpdateMarkAsRead(notificationListData,userId);

        totalPages = notificationCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          success: 1,
          message: 'Notifications listed successfully',
          items: notificationListData,
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: notificationCount,
          totalPages: totalPages
        }
        res.send(responseObj);
  }

  exports.markAsRead = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var notificationId = req.params.id;
    const newReadStatus = new MarkasRead({
      userId: userId,
      notificationId: notificationId,
      isRead: 1,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });
    try {
      let saveReadStatus = await newReadStatus.save();
      res.send({
        success: 1,
        message: 'Notifications status added successfully'
      })
    } catch (err) {
      console.error(err);
    }
  };

  exports.countUnread = (req, res) => {
    var filter = {
      markAsRead: 0
    };
    MarkasRead.countDocuments(filter).then(data => {
      res.send({
        success: 1,
        count: data
      })
    })
  }

  async function checkAndUpdateMarkAsRead(notificationListData,userId){
    for(let i = 0; i < notificationListData.length; i++){
      var notificationObj = notificationListData[i];
      if(notificationObj.notificationType === constants.GENERAL_NOTIFICATION_TYPE){
        var readUserIdArray = notificationObj.readUserIds;
        var index = await readUserIdArray.findIndex(id => JSON.stringify(id) === JSON.stringify(userId));
        if(index > -1){
          notificationListData[i].markAsRead = true;
        }else{
          notificationListData[i].markAsRead = false;
        }
        continue;
      }else{
        continue;
      }
    }
  }
