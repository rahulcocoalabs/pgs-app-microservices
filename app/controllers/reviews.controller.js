var moment = require('moment');
const Review = require('../models/review.model.js');
const User = require('../models/user.model.js');
var utilities = require('../components/utilities.component.js');
var gateway = require('../components/gateway.component.js');
const constants = require('../helpers/constants');
var config = require('../../config/app.config.js');
var reviewsConfig = config.reviews;
var userConfig = config.users;

  exports.getReviews = (req, res) => {

    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || reviewsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : reviewsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };
    var queryProjection = {
      title: 1,
      description: 1,
      userId: 1,
      user: 1,
      rating: 1,
      maxRating: 1,
      tsCreatedAt: 1
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
    }


    var id = params.itemId;
    if (!id) {
      var responseObj = {
        success: 0,
        status: 400,
        errors: [{
          field: "itemId",
          message: "itemId is missing"
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
      itemId: id,
      status: 1
    }

    Review.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate('user').then(reviewsList => {
      Review.countDocuments(filters, function (err, itemsCount) {

        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);

        var i = 0;
        var len = reviewsList.length;
        var reviews = [];
        var tempPostTime = null;
        var user = null;
        while (i < len) {
          tempPostTime = moment.unix(reviewsList[i].tsCreatedAt).utcOffset("+05:30").format('hh:mm A, DD MMMM YYYY');
          user = reviewsList[i].user;
          if (user) {
            user = {
              id: user.id,
              firstName: user.firstName,
              middleName: user.middleName,
              lastName: user.lastName,
              image: user.image,
            }
          }
          reviews.push({
            id: reviewsList[i].id,
            datetime: tempPostTime,
            title: reviewsList[i].title,
            description: reviewsList[i].description,
            rating: reviewsList[i].rating,
            maxRating: reviewsList[i].maxRating,
            user: user
          })
          i++;
        }
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: userConfig.imageBase,
          items: reviews,
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

  exports.postReview = (req, res) => {
    let bearer = req.headers['authorization'];
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    var coinType = constants.COIN_REVIEW_APP;
    if (!params.title || !params.description || !params.itemId || !params.itemType || !params.rating) {
      errors = [];
      if (!params.title) {
        errors.push({
          field: "title",
          message: "Title cannot be empty"
        });
      }
      if (!params.description) {
        errors.push({
          field: "description",
          message: "Description cannot be empty"
        });
      }
      if (!params.itemId) {
        errors.push({
          field: "itemId",
          message: "itemId cannot be empty"
        });
      }
      if (!params.itemType) {
        errors.push({
          field: "itemType",
          message: "itemType cannot be empty"
        });
      }
      if (!params.rating) {
        errors.push({
          field: "rating",
          message: "rating cannot be empty"
        });
      }
      /*if (params.itemId) {
          var ObjectId = require('mongoose').Types.ObjectId;
          var isValidId = ObjectId.isValid(id);
          if(!isValidId)
              errors.push({ field: "itemId", message: "itemId is not a valid object id" });
      }*/
      return res.status(200).send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    const newReview = new Review({
      title: params.title,
      description: params.description,
      itemId: params.itemId,
      itemType: params.itemType,
      userId: userId,
      rating: params.rating,
      maxRating: params.maxRating || reviewsConfig.maxRating,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });
    newReview.save()
      .then(data => {
        // let updateCoinReqObj = {
        //   userId,
        //   coinType,
        //   bearer,
        //   url: constants.API_UPDATE_COIN,
        // };

        // updateCoinCount(updateCoinReqObj, function (err, trendingBooksRes) {
          var formattedData = {
            success: 1,
            message: "Review Submitted..."
          };
          res.send(formattedData);
        // });
      }).catch(err => {
        res.status(500).send({
          success: 0,
          status: 500,
          message: err.message || "Some error occurred while submitting reivew."
        });
      });
  }

  exports.updateReview = (req, res) => {

    var params = req.body;
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
    if (!params.title && !params.description && !params.rating) {
      return res.send({
        success: 0,
        errors: "No changes Submitted",
        code: 200
      });
    }

    var filter = {
      status: 1,
      _id: id
    };

    var update = {};

    var options = {
      new: true
    };

    if (params.title) {
      update.title = params.title;
    }
    if (params.description) {
      update.description = params.description
    }
    if (params.rating) {
      update.rating = params.rating;
    }

    Review.updateOne(filter, update, options, function (err, response) {
      if (err) {
        var responseObj = {
          success: 0,
          status: 500,
          errors: [{
            field: "",
            message: "Error updating review " + err
          }]
        }
        res.send(responseObj);
        return;
      } else {
        responseObj = {
          success: 1,
          message: "Review successfully updated..."
        };
        res.send(responseObj);
        return;
      }

    });
  }
  exports.deleteReview = (req, res) => {

    var params = req.params;
    var id = params.id;
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


    var filter = {
      status: 1,
      _id: id
    };

    var update = {
      status: 0
    };

    var options = {
      new: true
    };

    Review.updateOne(filter, update, options, function (err, response) {
      if (err) {
        var responseObj = {
          success: 0,
          status: 500,
          errors: [{
            field: "",
            message: "Error deleting review " + err
          }]
        }
        res.send(responseObj);
        return;
      } else {
        responseObj = {
          success: 1,
          status: 200,
          message: "Review successfully deleted..."
        };
        res.send(responseObj);
        return;
      }

    });
  }
  exports.getUserReviews = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.query;
    var filters = {
      status: 1,
      userId: userId
    };
    var queryProjection = {
      title: 1,
      description: 1,
      userId: 1,
      user: 1,
      rating: 1,
      maxRating: 1,
      tsCreatedAt: 1
    };
    var sortOptions = {};
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = params.perPage || reviewsConfig.resultsPerPage;
    var settings = {
      filters: filters,
      page: page,
      perPage: perPage,
      pagination: true,
      queryProjection: queryProjection,
      model: Review,
      returnPageData: true
    };
    //var imageBase = reviewsConfig.imageBase;
    utilities.getList(settings, function (result) {
      var len = result.items.length;
      var i = 0;
      itemsFormatted = [];
      while (i < len) {
        itemsFormatted.push({
          userId: result.items[i].userId || null,
          title: result.items[i].title || null,
          description: result.items[i].description || null,
          rating: result.items[i].rating || null,
          maxRating: result.items[i].maxRating || null,
          time: moment(result.items[i].tsCreatedAt).format("ddd, DD MMM YYYY") || null,
          itemImageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/store/products/",
          itemImage: "catalog/1.jpg",
          id: result.items[i].id || null
        });
        i++;
      }
      // result.imageBase = imageBase;
      result.items = itemsFormatted;
      res.send(result);
    });
  }


function updateCoinCount(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  // gateway.patchWith(url, reqObj, function (err, result) {
    gateway.patchWithAuth(url,reqObj, bearer, function (err, result) {
      console.log(result);
    if (err) {
      console.log("Error while updating coin..." + url);

    }
    callback(err, result);
  });

};

