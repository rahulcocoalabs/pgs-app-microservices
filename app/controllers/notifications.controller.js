
  const Notification = require('../models/notification.model.js');
  const MarkasRead = require('../models/notificationStatus.model.js');
  var config = require('../../config/app.config.js');
  var moment = require('moment');
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
    var pageParams = {
      skip: offset,
      limit: perPage
    };
    var filter = {
      userIds: {
        $elemMatch: {
          $eq: userId
        }
      }
    };
    var queryProjection = {
      title: 1,
      content: 1,
      params: 1,
      sendStatus: 1

    };
    Notification.find(filter, queryProjection, pageParams).then(result => {
      Notification.countDocuments(filter, function (err, itemsCount) {
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          success: 1,
          message: 'Notifications listed successfully',
          items: result,
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: itemsCount,
          totalPages: totalPages
        }
        res.send(responseObj);
      })
    })
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
