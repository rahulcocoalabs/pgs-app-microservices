
const Notification = require('../models/notification.model.js');
const MarkasRead = require('../models/notificationStatus.model.js');
var config = require('../../config/app.config.js');
var moment = require('moment');
const constants = require('../helpers/constants.js');

var notificationsConfig = config.notifications;

exports.listAll = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || notificationsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : notificationsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var findCriteria = {
    $or: [
      { userId: userId },
      { notificationType: constants.GENERAL_NOTIFICATION_TYPE }
    ]
  }
  findCriteria.status = 1;
  var queryProjection = {
    title: 1,
    content: 1,
    type: 1,
    referenceId: 1,
    notificationType: 1,
    userId: 1,
    markAsRead: 1,
    userId: 1,
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

  var notificationCount = await Notification.countDocuments(findCriteria)
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
  notificationListData = await checkAndUpdateMarkAsRead(notificationListData, userId);

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
  return res.send(responseObj);
}

exports.markAsRead = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var notificationId = req.params.id;

  var findCriteria = {
    _id: notificationId,
    status: 1
  };
  var notificationCheck = await Notification.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking notification',
        error: err
      }
    })
  if (notificationCheck && (notificationCheck.success !== undefined) && (notificationCheck.success === 0)) {
    return notificationCheck;
  }
  if (notificationCheck) {
    if (notificationCheck.notificationType === constants.INDIVIDUAL_NOTIFICATION_TYPE
      && JSON.stringify(notificationCheck.userId) !== JSON.stringify(userId)) {
      return res.send({
        success: 0,
        message: 'Invalid notification id'
      });
    } else {
      if (notificationCheck.markAsRead !== undefined
        && notificationCheck.markAsRead !== null
        && notificationCheck.markAsRead
        && notificationCheck.notificationType === constants.INDIVIDUAL_NOTIFICATION_TYPE) {
        var update = {};
        update.markAsRead = true;
        update.tsModifiedAt = Date.now();
        var updateStatus = await updateMarkAsRead(update, findCriteria);
        return res.send(updateStatus);

      } else if (notificationCheck.markAsRead !== undefined
        && notificationCheck.markAsRead !== null && notificationCheck.markAsRead === false) {
        return res.send({
          success: 0,
          message: 'Notification already read'
        });
      } else if (notificationCheck.notificationType === constants.GENERAL_NOTIFICATION_TYPE) {
        var readUserIdArray = notificationCheck.readUserIds;
        var index = await readUserIdArray.findIndex(id => JSON.stringify(id) === JSON.stringify(userId));
        if (index > -1) {
          return res.send({
            success: 0,
            message: 'Notification already read'
          });
        } else {
          var update = { $push: { readUserIds: userId } }
          update.tsModifiedAt = Date.now();
          var updateStatus = await updateMarkAsRead(update, findCriteria);
          return res.send(updateStatus);
        }
      }

    }
  } else {
    return res.send({
      success: 0,
      message: 'Invalid notification id'
    });

  }


};

exports.countUnread = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var findCriteria = {
    userId,
    markAsRead: false,
    status: 1
  }

  var individualUnreadNotificationCount = await Notification.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting count individual unread notification',
        error: err
      }
    })
  if (individualUnreadNotificationCount && (individualUnreadNotificationCount.success !== undefined) && (individualUnreadNotificationCount.success === 0)) {
    return individualUnreadNotificationCount;
  }

  var findCriteria = {
    readUserIds: {
      $in: [userId]
    },
    status: 1
  }

  var generalUnreadNotificationCount = await Notification.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting count general unread notification',
        error: err
      }
    })
  if (generalUnreadNotificationCount && (generalUnreadNotificationCount.success !== undefined) && (generalUnreadNotificationCount.success === 0)) {
    return generalUnreadNotificationCount;
  }
  var notificationCount = individualUnreadNotificationCount + generalUnreadNotificationCount;

  return res.send({
    success: 1,
    count: notificationCount,
    message: "Notification count"
  })
}

async function checkAndUpdateMarkAsRead(notificationListData, userId) {
  for (let i = 0; i < notificationListData.length; i++) {
    var notificationObj = notificationListData[i];
    if (notificationObj.notificationType === constants.GENERAL_NOTIFICATION_TYPE) {
      var readUserIdArray = notificationObj.readUserIds;
      var index = await readUserIdArray.findIndex(id => JSON.stringify(id) === JSON.stringify(userId));
      if (index > -1) {
        notificationListData[i].markAsRead = true;
      } else {
        notificationListData[i].markAsRead = false;
      }
      continue;
    } else {
      continue;
    }
  }
}
async function updateMarkAsRead(update, findCriteria) {
  var notificationUpdateData = await Notification.update(findCriteria, update)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while updating notification read status',
        error: err
      }
    })
  if (notificationUpdateData && (notificationUpdateData.success !== undefined) && (notificationUpdateData.success === 0)) {
    return notificationUpdateData;
  }
  return {
    success: 1,
    message: 'Notification read successfully'
  }
}