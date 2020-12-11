var gateway = require('../components/gateway.component.js');
const User = require('../models/user.model.js');
const Nationality = require('../models/nationality.model.js');
const Feed = require('../models/feed.model.js');

const Coin = require('../models/coin.model');
const Language = require('../models/language.model');
const Contest = require('../models/contest.model');
var config = require('../../config/app.config.js');
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');

var feedsConfig = config.feeds;
var usersConfig = config.users;
var emotionsConfig = config.emotions;
const contestsConfig = config.contests;
var moment = require("moment");
var ObjectId = require('mongoose').Types.ObjectId;

function updateCoinCount(reqObj, callback) {
  // let bearer = reqObj.bearer;
  let url = reqObj.url;
  // delete reqObj.bearer;
  delete reqObj.url;
  gateway.patchWithAuth(url, reqObj, function (err, result) {
    // gateway.patchWith(url,reqObj, bearer, function (err, result) {
    if (err) {
      console.log("Error while updating coin..." + url);

    }
    callback(err, result);
  });

};


function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function getApisWithAuth(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  gateway.getWithAuth(url, reqObj, bearer, function (err, result) {
    if (err) {
      console.log("Error fetching...");
    }
    callback(err, result);
  });

};

exports.listAll = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var findUser = await User.findOne({
    _id: userId,
    status: 1
  });
  var dob = findUser.dob;
  var dobYear = dob.getFullYear();
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var age = currentYear - dobYear;
  var language = findUser.language;
  var filters = {
    $and: [{
      startAge: {
        $lte: age
      },
    }, {
      endAge: {
        $gte: age
      },
    }],
    languageId: {
      $in: language
    },
    status: 1,
    isApproved: 1
  };
  var queryProjection = {
    title: 1,
    creatorDob: 1,
    images: 1,
    type: 1,
    feedType: 1,
    tsCreatedAt: 1,
    description: 1,
    youTubeLink: 1,
    video: 1,
    documents: 1,
    authorUserId: 1,
    emotions: 1,
    isApproved: 1,
    contest: 1
  };

  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;

  var perPage = params.perPage || feedsConfig.resultsPerPage;
  perPage = Number(perPage) > 0 ? Number(perPage) : feedsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };

  /* Sort */
  var sortOptions = {};
  var sortOrder = -1;
  if (params.sortBy) {
    if (params.sortOrder && params.sortOrder == 'asc')
      sortOrder = 1;
    if (params.sortOrder && params.sortOrder == 'desc')
      sortOrder = -1;
    if (params.sortBy == 'popularity')
      sortOptions.viewCount = sortOrder ? sortOrder : -1;
    if (params.sortBy == 'time')
      sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
  }
  if (!params.sortBy) {
    sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
  }

  //Feed.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['authorUser', 'emotions.user']).then(feedsList => {
  // Feed.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(feedsList => {

  Feed.find(filters, queryProjection, pageParams)
    .sort(sortOptions)
    .limit(perPage)
    .populate([{
      path: 'authorUser',
      select: {
        firstName: 1,
        middleName: 1,
        lastName: 1,
        image: 1,
        _id: 1
      }
    }, {
      path: 'contest',
      select: 'title place description image'
    }]).then(feedsList => {
      // Feed.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['authorUser']).then(feedsList => {
      if (!feedsList) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Feed not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }

      for (let i = 0; i < feedsList.length; i++) {
        // console.log("feedId : " + feedsList[i]._id)
        // console.log("authorUserId : " + feedsList[i].authorUserId)

      }

      Feed.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var len = feedsList.length;
        while (i < len) {
          if (feedsList[i].type == 'image') {
            feedsList[i].documents = null;
            feedsList[i].video = null;
          }
          if (feedsList[i].type == 'video') {
            feedsList[i].images = null;
            feedsList[i].documents = null;
          }
          if (feedsList[i].type == 'document') {
            feedsList[i].video = null;
            feedsList[i].images = null;
          }
          if (feedsList[i].type == 'text') {
            feedsList[i].video = null;
            feedsList[i].images = null;
            feedsList[i].documents = null;
          }
          if (feedsList[i].type != 'image' && feedsList[i].type != 'video' && feedsList[i].type != 'document' && feedsList[i].type != 'youTubeLInk') {
            feedsList[i].type = 'text';
            feedsList[i].video = null;
            feedsList[i].images = null;
            feedsList[i].documents = null;

          }
          i++;
        }
        //Make other fields null

        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var array = [];
        for (y in feedsList) {
          let object = feedsList[y];
          let obj = favouriteObject(userId, object.emotions);
          object.emotionsInfo1 = obj;
          console.log("10/12", obj)
          array.push(object)
        }
        var responseObj = {
          imageBase: feedsConfig.imageBase,
          documentImage: feedsConfig.documentImage,
          videoBase: feedsConfig.videoBase,
          documentBase: feedsConfig.documentBase,
          userImageBase: usersConfig.imageBase,
          contestImageBase: contestsConfig.imageBase,
          items: array,
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

function favouriteObject(userId, list) {

  var ret = {};
  for (x in list) {
    console.log('10/12/1', list[x], userId);
    if (list[x].userId == userId) {
      ret.userEmotion = true;
      ret.heartfilled = 1;
    }
  }

  return ret;

}

exports.getSummary1 = async (req, res) => {

  var userId = req.identity.data.userId;
  var params = req.query;
  var page = params.page ? params.page : 1;
  var perPage = params.perPage ? params.perPage : feedsConfig.perPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };

  var feeds = await Feed.find({ status: 1 }, {}, pageParams).catch(err => {
    return { success: 0, message: err.message };
  })

  if (feeds && feeds.success && feeds.success === 1) {
    return res.send(feeds);
  }

  var array = [];
  for (x in feeds) {
    let object = feeds[x];
    let emotions = object.emotions;
    var emotionObject = {
      userEmotion: null,
      total: 0,
      love: 0,
      happy: 0,
      heartfilled: 0,
      surprise: 0,
      sad: 0,
      angry: 0
    };
    for (y in emotions) {
      let emotion = emotions[y];
      if (emotion.userId === userId) {
        emotionObject.userEmotion = emotion.emotion;
      }
      if (emotion.emotion == "heartfilled") {
        emotionObject.heartfilled += 1;
      }
      if (emotion.emotion == "sad") {
        emotionObject.sad += 1;
      }
      if (emotion.emotion == "happy") {
        emotionObject.sad += 1;
      }
      if (emotion.emotion == "surprie") {
        emotionObject.surprise += 1;
      }
      if (emotion.emotion == "angry") {
        emotionObject.angry += 1;
      }
      if (emotion.emotion == "love") {
        emotionObject.love += 1;
      }
    }
    object.emotionsInfo1 = emotionObject;
    array.push(object)
  }

  var totalPages = array.length / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;

  var feedsSummary = {
    imageBase: feedsConfig.imageBase,
    documentImage: feedsConfig.documentImage,
    videoBase: feedsConfig.videoBase,
    documentBase: feedsConfig.documentBase,
    authorImageBase: feedsConfig.authorImageBase,
    //adsImageBase: adsResult.imageBase,
    totalItems: array.length,
    page: Number(page),
    perPage: perPage,
    hasNextPage: hasNextPage,
    totalPages: totalPages,
    items: array
  }

  var summary = {
    feeds: feedsSummary,
   
  }
  res.send(summary);
 
}

exports.getSummary = (req, res) => {
  var params = req.query;
  var page = params.page ? params.page : 1;
  var perPage = params.perPage ? params.perPage : feedsConfig.perPage;
  var summary = {};
  let bearer = req.headers['authorization'];
  let feedsReqObj = {
    page: page,
    perPage: perPage,
    bearer,
    url: constants.API_FEEDS
  };

  getApisWithAuth(feedsReqObj, function (err, feedsResult) {
    var feeds = {
      items: []
    };
    if (!err) {
      feeds = JSON.parse(feedsResult);
    }
    let adsReqObj = {
      page: page,
      perPage: perPage,
      bearer,
      url: constants.API_ADS_LIST
    };
    getApisWithAuth(adsReqObj, function (err, adsResult) {
      var ads = {
        items: []
      };
      if (!err) {
        ads = JSON.parse(adsResult);
      }

      var items = feeds.items || [];
      if (ads.items && Array.isArray(ads.items) && ads.items.length) {
        var k = 0;
        while (k < ads.items.length) {
          items.push({
            type: 'advertisement',
            id: ads.items[k].id,
            title: ads.items[k].title,
            thumbnail: ads.items[k].thumbnail,
            image: ads.items[k].image
          });
          k++;
        }
      }
      var feedsSummary = {
        imageBase: feedsConfig.imageBase,
        documentImage: feedsConfig.documentImage,
        videoBase: feedsConfig.videoBase,
        documentBase: feedsConfig.documentBase,
        authorImageBase: feedsConfig.authorImageBase,
        adsImageBase: adsResult.imageBase,
        totalItems: feeds.totalItems,
        page: Number(feeds.page),
        perPage: feeds.perPage,
        hasNextPage: feeds.hasNextPage,
        totalPages: feeds.totalPages,
        items: utilities.shuffleArray(items)
      }
      var summary = {
        feeds: feedsSummary,
        ads: ads
      }
      res.send(summary);

    });
  });


}

exports.getSummaryForWeb = (req, res) => {
  var params = req.query;
  var page = params.page ? params.page : 1;
  var perPage = params.perPage ? params.perPage : feedsConfig.perPage;
  var summary = {};
  let bearer = req.headers['authorization'];
  let feedsReqObj = {
    page: page,
    perPage: perPage,
    bearer,
    url: constants.API_FEEDS
  };
  getApisWithAuth(feedsReqObj, function (err, feedsResult) {
    var feeds = {
      items: []
    };
    if (!err) {
      feeds = JSON.parse(feedsResult);
    }
    let adsReqObj = {
      page: page,
      perPage: perPage,
      bearer,
      url: constants.API_FEEDS
    };
    getApisWithAuth(adsReqObj, function (err, adsResult) {
      var ads = {
        items: []
      };
      if (!err) {
        ads = JSON.parse(adsResult);

        var items = [];

        items.push({
          type: 'feed',
          title: 'Latest Feeds',
          imageBase: feeds.imageBase,
          totalItems: feeds.totalItems,
          page: Number(feeds.page),
          perPage: feeds.perPage,
          totalPages: feeds.totalPages,
          hasNextPage: feeds.hasNextPage,
          items: feeds.items
        });
        items.push({
          type: "app-ad",
          title: "Download our mobile app for better experience",
          imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
          image: "app-screen.png",
          links: [{
            icon: "play-store.png",
            url: "playstoreurl.com"
          }, {
            icon: "app-store.png",
            url: "appstoreurl.com"
          }],
          description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, sit facere. Quasi dolorem odio magnam ratione. Ea quasi expedita fugit unde aut cum adipisci facilis culpa, maiores debitis assumenda perferendis."
        });


        items.push({
          type: "advertisement",
          title: "Advertisements",
          imageBase: ads.imageBase,
          items: ads.items,
          totalItems: ads.totalItems
        });
        var summary = {
          items: items
        }
        res.send(summary);
      }
    });
  });


}
exports.createFeed = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.body;
  var files = req.files;
  var youTubeLink = req.body.youTubeLink;
  if (!params.title || !params.feedType) {
    errors = [];
    if (!params.title) {
      errors.push({
        field: "title",
        message: "Title cannot be empty"
      });
    }
    if (!params.feedType) {
      errors.push({
        field: "feedType",
        message: "Feed type cannot be empty"
      });
    }
    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }

  if (params.feedType == 'contest') {
    if (!params.contestId) {
      return res.status(400).send({
        success: 0,
        field: 'contestId',
        message: 'contestId cannot be empty'
      })
    }
  }

  var type = req.body.type || null;
  var images = [];
  var documents = [];
  var video = null;
  if (!youTubeLink) {
    if (req.files.images && !req.files.video && !req.files.documents) {
      console.log("Image field detected");
      type = "image";
      var len = files.images.length;
      var i = 0;
      while (i < len) {
        images.push(files.images[i].filename);
        i++;
      }
      console.log("images is " + images);
    }
    if (!req.files.images && req.files.video && !req.files.documents) {
      if (req.files.video[0].size > 10485760) {
        return res.send({
          success: 0,
          field: 'video',
          message: "video File size exceeded 10mb limit"
        })
      }
      type = "video";
      video = req.files.video[0].filename;
    }
    if (!req.files.images && !req.files.video && req.files.documents) {
      type = "document";
      var len = files.documents.length;
      var i = 0;
      while (i < len) {
        documents.push(files.documents[i].filename);
        i++;
      }

    }
    if (!req.files.images && !req.files.video && !req.files.documents) {
      type = "text";
    }
  }

  if (youTubeLink) {
    type = "youTubeLInk";

  }

  try {
    let findUser = await User.findOne({
      _id: userId,
      status: 1
    }).populate('language');
    let creatorDob = findUser.dob.getFullYear()
    let creatorLanguage = findUser.language.name;
    const newFeed = new Feed({
      title: params.title,
      feedType: params.feedType,
      youTubeLink: youTubeLink || null,
      description: params.description || null,
      images: images || [],
      video: video || null,
      documents: documents || [],
      type: type,
      contest: params.contestId || null,
      authorUserId: userId,
      creatorDob: creatorDob,
      creatorLanguage: creatorLanguage,
      emotions: [],
      status: 1,
      isApproved: 0,
      isRejected: 0,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });
    if (params.feedType == 'contest') {
      let checkUser = await Feed.find({
        authorUserId: userId,
        contest: params.contestId,
        feedType: 'contest',
        status: 1
      });
      if (checkUser.length > 0) {
        return res.send({
          success: 0,
          message: 'You are not allowed to upload more than once'
        })
      }
    }
    let saveFeed = await newFeed.save();
    // let findCoins = await findCoinCount(saveFeed.type);
    // let totalCoinsNow = findUser.coinCount;
    // let updateCoins = await User.findOneAndUpdate({
    //   _id: userId,
    //   status: 1
    // }, {
    //   $push: {
    //     coinHistory: {
    //       coinType: saveFeed.type,
    //       coinDate: Number(moment().unix()),
    //       coinCount: findCoins
    //     }
    //   },
    //   coinCount: totalCoinsNow + findCoins
    // }, {
    //   useFindAndModify: false
    // });
    res.status(200).send({
      success: 1,
      message: "Feed Posted Successfully"
    });
  } catch (err) {
    // res.status(500).send({
    //   success: 0,
    //   message: 'Something went wrong while creating feed'
    // })
    console.log(err);
  }
}

async function findCoinCount(type) {
  let coins = await Coin.findOne({
    status: 1
  });
  let coinCount;
  if (type == 'image') {
    coinCount = coins.photo;
  } else if (type == 'video') {
    coinCount = coins.video;
  } else if (type == 'document') {
    coinCount = coins.doc;
  } else {
    coinCount = coins.youtube;
  }
  return Number(coinCount);
}

exports.updateFeed = (req, res) => {
  if (!req.files) req.files = {
    images: null,
    documents: null,
    video: null
  };
  console.log("Update feed function called");
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
  if (!params.title && !params.description && !req.files.images && !req.files.video && !req.files.documents && !params.removeItems) {
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

  var update = {
    tsModifiedAt: Number(moment().unix())
  };

  var options = {
    new: true
  };

  if (req.files.images || req.files.video || req.files.documents || params.removeItems) {
    console.log("Some files uploaded or changes submitted");
    //also dont forget to chage approval status in this case
    var findFilters = {
      status: 1,
      _id: id
    };
    var findQueryProjection = {
      images: 1,
      video: 1,
      documents: 1,
      type: 1
    };
    var update = {};
    Feed.findOne(findFilters, findQueryProjection).then(feed => {
      //do the pre-check here . Logic -> find feed type -> count corrosponding new images/documents/videos -> count remove Items -> do math, if its no way working, return 0
      if (feed.type == 'image' || feed.type == 'video' || feed.type == 'document') {
        console.log("Feed found and feed type is " + feed.type);
        var currentItemsCount = 0;
        var newItemsCount = 0;
        var removeItemsCount = 0;
        if (feed.type == 'image') {
          console.log("Feed type is image and available images are " + feed.images);
          if (feed.images && Array.isArray(feed.images)) currentItemsCount = feed.images.length;
          if (req.files.images && Array.isArray(req.files.images)) newItemsCount = req.files.images.length;
          if (params.removeItems && Array.isArray(params.removeItems)) removeItemsCount = params.removeItems.length;
        }
        if (feed.type == 'document') {
          console.log("Feed type is docuemnt and available docuemnts are " + feed.documents);
          if (feed.documents && Array.isArray(feed.documents)) currentItemsCount = feed.documents.length;
          if (req.files.documents && Array.isArray(req.files.documents)) newItemsCount = req.files.documents.length;
          if (params.removeItems && Array.isArray(params.removeItems)) removeItemsCount = params.removeItems.length;
        }
        if (feed.type == 'video') {
          console.log("Feed type is video and available video is " + feed.video);
          if (feed.video) currentItemsCount = 1;
          if (req.files.video) newItemsCount = 1;
          if (params.removeItems && Array.isArray(params.removeItems)) removeItemsCount = params.removeItems.length;
          removeItemsCount = removeItemsCount ? 1 : 0;
        }
        if (currentItemsCount + newItemsCount - removeItemsCount > feedsConfig.maxImageCount) {
          res.send({
            success: 0,
            status: 500,
            errors: [{
              field: "images",
              message: "Maximum images Limit is " + feedsConfig.maxImageCount
            }]
          })
        }
      }
      //pre check end
      if (!feed) {
        res.send({
          success: 0,
          status: 500,
          errors: [{
            field: "feedId",
            message: "Feed not found with id"
          }]
        });
      }

      if (feed.type == 'image') {
        console.log("Location 1");
        //new flow start
        //step 1 - add old images to update
        var updateImages = feed.images;
        if (!Array.isArray(updateImages)) updateImages = [];
        //step 2 -remove images in removeItems list
        params.removeItems = params.removeItems.replace(/^\[|\]|\"|\'$/g, "").split(", ");
        console.log(params.removeItems);
        console.log(Array.isArray(params.removeItems));
        console.log(params.removeItems.length);
        if (params.removeItems && Array.isArray(params.removeItems) && params.removeItems.length) {
          console.log("Remove items array received ");
          console.log("Remove Items Length is " + params.removeItems.length);
          var i = 0;
          var spliceIndexTemp;
          while (i < params.removeItems.length) {

            console.log("In remove Items loop");
            if (updateImages.indexOf(params.removeItems[i]) > -1) {
              // console.log("Item Check #" + i + "RemoveItem : " + ) //continue from here
              console.log("One item in remove items found in old items list");
              spliceIndexTemp = updateImages.indexOf(params.removeItems[i]);
              console.log("Going to remove item at index " + spliceIndexTemp);
              if (spliceIndexTemp > -1) {
                console.log("Inside splice condition");
                updateImages.splice(spliceIndexTemp, 1);
              }
            }
            i++;
          }
        }
        //step 3 - add new items to array
        if (req.files.images && Array.isArray(req.files.images) && req.files.images.length) {
          var j = 0;
          while (j < req.files.images.length) {
            updateImages.push(req.files.images[j].filename);
            j++;
          }
        }
        //step 4 - check if it satisfy limit
        if (updateImages.length > 10) {
          res.send({
            success: 0,
            status: 500,
            errors: [{
              field: "images",
              message: "Maximum images Limit is " + feedsConfig.maxImageCount
            }]
          })
        }
        console.log("New update array is " + updateImages);
        //new flow end


        //Add changes in image to update
        update = {
          tsModifiedAt: Number(moment().unix()),
          images: updateImages
        };
      }

      //if document start
      if (feed.type == 'document') {
        var updateDocuments = feed.documents;
        if (!Array.isArray(updateDocuments)) updateDocuments = [];
        params.removeItems = params.removeItems.replace(/^\[|\]|\"|\'$/g, "").split(", ");
        if (params.removeItems && Array.isArray(params.removeItems) && params.removeItems.length) {
          var i = 0;
          var spliceIndexTemp;
          while (i < params.removeItems.length) {
            if (updateDocuments.indexOf(params.removeItems[i]) > -1) {
              spliceIndexTemp = updateDocuments.indexOf(params.removeItems[i]);
              if (spliceIndexTemp > -1) {
                updateDocuments.splice(spliceIndexTemp, 1);
              }
            }
            i++;
          }
        }
        if (req.files.documents && Array.isArray(req.files.documents) && req.files.documents.length) {
          var j = 0;
          while (j < req.files.documents.length) {
            updateDocuments.push(req.files.documents[j].filename);
            j++;
          }
        }
        if (updateDocuments.length > 10) {
          res.send({
            success: 0,
            status: 500,
            errors: [{
              field: "documents",
              message: "Maximum documents Limit is " + feedsConfig.maxImageCount
            }]
          })
        }

        update = {
          tsModifiedAt: Number(moment().unix()),
          documents: updateDocuments
        };
      }

      if (feed.type == 'video') {
        var videoChangedFlag = false;
        var updateVideo = feed.video;
        params.removeItems = params.removeItems.replace(/^\[|\]|\"|\'$/g, "").split(", ");
        if (params.removeItems && Array.isArray(params.removeItems) && params.removeItems.length) {
          var i = 0;
          var spliceIndexTemp;
          while (i < params.removeItems.length) {
            if (removeItems[i] == updateVideo) {
              videoChangedFlag = true;
              updateVideo = null;
            }
          }
          i++;
        }
        if (req.files.video) {
          if (!updateVideo) {
            videoChangedFlag = true;
            updateVideo = req.files.video.filename;
          }
        }
        if (videoChangedFlag) {
          update = {
            tsModifiedAt: Number(moment().unix()),
            video: updateVideo
          };
        }
      }


      if (params.title) {
        update.title = params.title;
      }
      if (params.description) {
        update.description = params.description
      }

      //update here
      Feed.updateOne(filter, update, options, function (err, result) {
        if (err) {
          var responseObj = {
            success: 0,
            status: 500,
            errors: [{
              field: "",
              message: "Error updating feed " + err
            }]
          }
          res.send(responseObj);
          return;
        } else {
          var updateLog = "";
          if (update.title) updateLog = updateLog + " Title Updated.";
          if (update.description) updateLog = updateLog + " Description Updated.";
          if (update.images) updateLog = updateLog + " Images Updated.";
          if (update.docuements) updateLog = updateLog + " Documents Updated.";
          if (update.video) updateLog = updateLog + " Video Updated.";
          responseObj = {
            success: 1,
            message: updateLog
          };
          res.send(responseObj);
          return;
        }

      });



    });
  } else {

    if (params.title) {
      update.title = params.title;
    }
    if (params.description) {
      update.description = params.description
    }

    Feed.updateOne(filter, update, options, function (err, result) {
      if (err) {
        var responseObj = {
          success: 0,
          status: 500,
          errors: [{
            field: "",
            message: "Error updating feed " + err
          }]
        }
        res.send(responseObj);
        return;
      } else {
        var updateLog = "";
        if (update.title) updateLog = updateLog + " Title Updated.";
        if (update.description) updateLog = updateLog + " Description Updated.";
        if (update.images) updateLog = updateLog + " Images Updated.";
        if (update.docuements) updateLog = updateLog + " Documents Updated.";
        if (update.video) updateLog = updateLog + " Video Updated.";
        responseObj = {
          success: 1,
          message: updateLog
        };
        res.send(responseObj);
        return;
      }

    });
  }

}

exports.deleteFeed = (req, res) => {

  var params = req.params;


  var id = params.id;
  if (!id) {
    var responseObj = {
      success: 0,
      status: 400,
      errors: [{
        field: "id",
        message: "id param is missing"
      }]
    }
    res.send(responseObj);
    return;
  }


  Feed.deleteOne({
    _id: params.id
  }, function (err, response) {
    if (!err) {
      var responseObj = {
        success: 1,
        message: "Feed Deleted"
      }
      res.send(responseObj);
      return;
    }
    res.send({
      success: 0,
      message: "Error deleting items."
    });
    return;
  });


}

exports.removeEmotionFromFeed = (req, res) => {
  console.log("Inside delete exports function");
  var params = req.query;
  var errors = [];
  if (!params.feedId) {
    console.log("feedId not found");
    errors.push({
      field: "feedId",
      message: "feedId cannot be empty"
    });
  }
  if (params.feedId) {
    console.log("feedId found");
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(params.feedId);
    if (!isValidId) {
      errors.push({
        field: "feedId",
        message: "feedId is invalid"
      })
    }
  }
  if (errors.length) {
    res.send({
      success: 0,
      status: 400,
      errors: errors
    });
    return;
  }
  console.log("Error length is " + errors.length);

  var filters = {
    _id: params.feedId,
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }
  Feed.findOne(filters, queryProjection).then(feed => {
    if (!feed) {
      res.send({
        success: 0,
        status: 400,
        errors: {
          field: "feedId",
          message: "no feed found with given feedId"
        }
      });
    }
    var emotions = feed.emotions;
    var ObjectId = require('mongoose').Types.ObjectId;
    if (emotions.length) {
      var i = 0;
      var userEmotionFound = false;
      while (i < emotions.length) {
        console.log("On loop " + i);
        if (userEmotionFound) {
          console.log("User emotion already found. Skipping if condition");
          if (emotions[i + 1]) {
            emotions[i] = emotions[i + 1];
          }
          continue;
        }
        if (emotions[i].userId == userId) {
          console.log("Inside if condition");
          userEmotionFound = true;
          if (emotions[i + 1]) {
            emotions[i] = emotions[i + 1];
          }
        }
        i++;
      }
      if (userEmotionFound) {
        emotions.length = emotions.length - 1;
      }
    }
    console.log("Emotions array : ");
    console.log(emotions);
    //update record with new emotions
    var filter = {
      _id: params.feedId
    };
    var update = {
      emotions: emotions
    };
    var options = {
      new: true
    };
    Feed.updateOne(filter, update, options, function (err, response) {
      if (err) {
        var responseObj = {
          success: 0,
          status: 500,
          errors: [{
            field: "",
            message: "Error removing emotion " + err
          }]
        }
        res.send(responseObj);
        return;
      } else {
        responseObj = {
          success: 1,
          message: "Emotion successfully removed..."
        };
        res.send(responseObj);
        return;
      }
    });
  });
}

exports.addEmotionToFeed = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  //validating request
  var errors = [];
  if (!params.emotion) {
    errors.push({
      field: "emotion",
      message: "Emotion cannot be empty"
    });
  }
  if (!params.feedId) {
    errors.push({
      field: "feedId",
      message: "feedId cannot be empty"
    });
  }
  if (params.emotion) {
    if (!isInArray(params.emotion, emotionsConfig.emotionsList)) {
      errors.push({
        field: "emotion",
        message: "Invalid emotion"
      });
    }
  }
  if (params.feedId) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(params.feedId);
    if (!isValidId) {
      errors.push({
        field: "feedId",
        message: "feedId is invalid"
      })
    }
  }
  if (errors.length) {
    res.send({
      success: 0,
      status: 400,
      params,
      errors: errors
    });
    return;
  }
  var filters = {
    _id: params.feedId,
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }

  var feedsResult = await Feed.findOne(filter, queryProjection).catch(err => {
    return { success: 0, message: "did not find feed" }
  })

  if (feedsResult && feedsResult.success && feedsResult.success === 0) {
    return res.send(feedsResult);
  }

  var emotions = feedsResult.emotions;
  var ObjectId = require('mongoose').Types.ObjectId;
  if (emotions.length) {
    console.log("Emotions length is 0");
    var i = 0;
    userFoundFlag = false;
    while (i < emotions.length) {
      console.log("On loop " + i);
      console.log("userId is " + emotions[i].userId);
      if (emotions[i].userId == userId) {
        console.log("User emotion found");
        emotions[i].emotion = params.emotion;
        userFoundFlag = true;
      }
      i++;
    }
    if (!userFoundFlag) {
      console.log("User emotion not found");
      emotions.push({
        emotion: params.emotion,
        userId: userId
      });
    }
  } else {
    console.log("No emotions are present");
    emotions.push({
      emotion: params.emotion,
      userId: userId
    });
  }
  console.log("Emotions array : ");
  console.log(emotions);
  //update record with new emotions
  var filter = {
    _id: params.feedId
  };
  var update = {
    emotions: emotions
  };
  var updateFeed = await Feed.updateOne(filter, update).catch(err => {
    return { success: 0, message: "could not update favourites", error: err.message }
  });


  if (updateFeed && updateFeed.success && updateFeed.success === 0) {
    return res.send(updateFeed);
  }

  return res.send({
    sucess: 1,
    update,
    message: "emotion posted successfully"
  })

}
exports.addEmotionToFeed1 = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  //validating request
  var errors = [];
  if (!params.emotion) {
    errors.push({
      field: "emotion",
      message: "Emotion cannot be empty"
    });
  }
  if (!params.feedId) {
    errors.push({
      field: "feedId",
      message: "feedId cannot be empty"
    });
  }
  if (params.emotion) {
    if (!isInArray(params.emotion, emotionsConfig.emotionsList)) {
      errors.push({
        field: "emotion",
        message: "Invalid emotion"
      });
    }
  }
  if (params.feedId) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(params.feedId);
    if (!isValidId) {
      errors.push({
        field: "feedId",
        message: "feedId is invalid"
      })
    }
  }
  if (errors.length) {
    res.send({
      success: 0,
      status: 400,
      params,
      errors: errors
    });
    return;
  }
  var filters = {
    _id: params.feedId,
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }
  Feed.findOne(filters, queryProjection).then(feed => {
    if (!feed) {
      res.send({
        success: 0,
        status: 400,
        errors: {
          field: "feedId",
          message: "no feed found with given feedId"
        }
      });
    }
    var emotions = feed.emotions;
    var ObjectId = require('mongoose').Types.ObjectId;
    if (emotions.length) {
      console.log("Emotions length is 0");
      var i = 0;
      userFoundFlag = false;
      while (i < emotions.length) {
        console.log("On loop " + i);
        console.log("userId is " + emotions[i].userId);
        if (emotions[i].userId == userId) {
          console.log("User emotion found");
          emotions[i].emotion = params.emotion;
          userFoundFlag = true;
        }
        i++;
      }
      if (!userFoundFlag) {
        console.log("User emotion not found");
        emotions.push({
          emotion: params.emotion,
          userId: userId
        });
      }
    } else {
      console.log("No emotions are present");
      emotions.push({
        emotion: params.emotion,
        userId: userId
      });
    }
    console.log("Emotions array : ");
    console.log(emotions);
    //update record with new emotions
    var filter = {
      _id: params.feedId
    };
    var update = {
      emotions: emotions
    };
    var options = {
      new: true
    };
    var updateFeed = Feed.updateOne(filter, update).catch(err => {
      return { success: 0, message: "could not update favourites", error: err.message }
    });


    if (updateFeed && updateFeed.success && updateFeed.success === 0) {
      return res.send(updateFeed);
    }

    return res.send({
      sucess: 1,
      update,
      message: "emotion posted successfully"
    })
    // Feed.updateOne(filter, update, options, function (err, response) {
    //   if (err) {
    //     var responseObj = {
    //       success: 0,
    //       status: 500,
    //       errors: [{
    //         field: "",
    //         message: "Error posting emotion " + err
    //       }]
    //     }
    //     res.send(responseObj);
    //     return;
    //   } else {
    //     responseObj = {
    //       success: 1,
    //       message: "Emotion successfully posted..."
    //     };
    //     res.send(responseObj);
    //     return;
    //   }
    // });
  });

}

exports.getUserFeeds = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var filters = {
    status: 1,
    authorUserId: userId,
    feedType: constants.FEED_TYPE
  };
  var queryProjection = {
    title: 1,
    images: 1,
    type: 1,
    tsCreatedAt: 1,
    description: 1,
    video: 1,
    documents: 1,
    authorUserId: 1,
    authorUser: 1,
    emotions: 1,
    isApproved: 1,
    isRejected: 1,
    youTubeLink: 1
  };


  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };

  if (params.type == "approved") {
    filters.isApproved = 1;
    filters.isRejected = 0;
  }
  if (params.type == "pending") {
    filters.isApproved = 0;
    filters.isRejected = 0;

  }
  if (params.type == "rejected") {
    // filters.isApproved = 2;
    filters.isApproved = 0;
    filters.isRejected = 1;
  }
  /* Sort */
  var sortOptions = {};
  var sortOrder = -1;
  if (params.sortBy) {
    if (params.sortOrder && params.sortOrder == 'asc')
      sortOrder = 1;
    if (params.sortOrder && params.sortOrder == 'desc')
      sortOrder = -1;
    if (params.sortBy == 'popularity')
      sortOptions.viewCount = sortOrder ? sortOrder : -1;
    if (params.sortBy == 'time')
      sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
  }
  if (!params.sortBy) {
    sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
  }


  //Feed.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['authorUser', 'emotions.user']).then(feedsList => {
  Feed.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['authorUser']).then(feedsList => {
    console.log("feedsList")
    console.log(feedsList)
    console.log("feedsList")
    if (!feedsList) {
      var responseObj = {
        success: 0,
        status: 200,
        errors: [{
          field: "id",
          message: "Feed not found with id"
        }]
      }
      res.send(responseObj);
      return;
    }
    Feed.countDocuments(filters, function (err, itemsCount) {
      var i = 0;
      var len = feedsList.length;
      while (i < len) {
        if (feedsList[i].type == 'image') {
          feedsList[i].documents = null;
          feedsList[i].video = null;
        }
        if (feedsList[i].type == 'video') {
          feedsList[i].images = null;
          feedsList[i].documents = null;
        }
        if (feedsList[i].type == 'document') {
          feedsList[i].video = null;
          feedsList[i].images = null;
        }
        if (feedsList[i].type == 'text') {
          feedsList[i].video = null;
          feedsList[i].images = null;
          feedsList[i].documents = null;
        }
        if (feedsList[i].type == 'youTubeLInk') {
          feedsList[i].video = null;
          feedsList[i].images = null;
          feedsList[i].documents = null;
        }
        if (feedsList[i].type != 'image' && feedsList[i].type != 'video' && feedsList[i].type != 'document' && feedsList[i].type != 'youTubeLInk') {
          feedsList[i].type = 'text';
          feedsList[i].video = null;
          feedsList[i].images = null;
          feedsList[i].documents = null;

        }
        i++;
      }

      totalPages = itemsCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;
      var responseObj = {
        imageBase: feedsConfig.imageBase,
        documentImage: feedsConfig.documentImage,
        authorImageBase: feedsConfig.authorImageBase,
        videoBase: feedsConfig.videoBase,
        documentBase: feedsConfig.documentBase,
        items: feedsList,
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

exports.getOwnerPosts = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };
  var filter = {
    _id: userId
  };
  var filterFeeds = {
    authorUserId: userId
  }
  var queryProjection = {
    images: 1,
    docuements: 1,
    title: 1,
    description: 1,
    type: 1,
    isApproved: 1,
    tsCreatedAt: 1,
    emotions: 1,
  }
  var authorFirstName;
  var authorMiddleName;
  var authorLastName;
  var authorName;
  var authorImage;
  var authorAddress;
  User.findOne(filter, {}).populate('nationalityId', Nationality).then(result => {
    Feed.find(filterFeeds, queryProjection, pageParams).limit(perPage).then(feedsResult => {
      Feed.countDocuments(filterFeeds, function (err, itemsCount) {
        authorFirstName = result.firstName ? result.firstName : '';
        authorLastName = result.lastName ? result.lastName : '';
        authorMiddleName = result.middleName ? result.middleName : '';
        authorName = authorFirstName + ' ' + authorLastName;
        authorImage = result.image;
        authorAddress = result.nationalityId.name;
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          authorName: authorName,
          authorImage: authorImage,
          authorAddress: authorAddress,
          result: feedsResult,
          authorImageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/user-images/",
          imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/feeds/images/",
          documentImage: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/pdf.png",
          videoBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/feeds/videos/",
          documentBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/feeds/documents/",
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: itemsCount,
          totalPages: totalPages
        }
        res.send(responseObj)
      })
    })
  })
};