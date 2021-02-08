var gateway = require('../components/gateway.component.js');
var moment = require('moment');
const Video = require('../models/video.model.js');
const Category = require('../models/videoCategory.model.js');
var config = require('../../config/app.config.js');
const Favourite = require('../models/favourite.model.js');
const constants = require('../helpers/constants');


const VideoCategory = require('../models/videoCategory.model.js');
var videosConfig = config.videos;
var userConfig = config.users;
var videoCategoriesConfig = config.videoCategories;

/* ********* Functions ********** */

function getApisWithAuth(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  gateway.getWithAuth(url, reqObj, bearer, function (err, result) {
    if (err) {
      console.log("Error fetching videos ..." + url);
    }
    callback(err, result);
  });

};


  exports.listAllVideos = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      title: 1,
      image: 1,
      durationSeconds: 1,
      averageRating: 1,
      maxRating: 1,
      description: 1,
      tsPublishedAt: 1
    };


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || videosConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : videosConfig.resultsPerPage;
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

    if (params.isTrending) {
      isTrending = params.isTrending;
      filters.isTrending = isTrending;
    }

    if (params.categoryId) {
      filters.categoryIds = params.categoryId;
    }

    Video.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(videosList => {
      Video.countDocuments(filters, function (err, itemsCount) {

        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: videosConfig.imageBase,
          items: videosList,
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

  exports.getVideoDetail = (req, res) => {
    let bearer = req.headers['authorization'];
    var id = req.params.id;
    var userData = req.identity.data;
    var userId = userData.userId;
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
      title: 1,
      videoCategoryIds: 1,
      image: 1,
      youtubeId: 1,
      description: 1,
      durationSeconds: 1,
      viewCount: 1,
      averageRating: 1,
      maxRating: 1,
      tags: 1,
      tsPublishedAt: 1,
      publishedAt: 1,
      sharingUrl: 1,
      isFav: 1
    };
    // get data
    Video.findOne(filters, queryProjection).then(video => { //ok
      if (!video) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Video not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      videoId = id;

      let topTrendingReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_VIDEOS_LIST,
        isTrending: true
      };
      getApisWithAuth(topTrendingReqObj, function (err, trendingVideosRes) {
        var trendingVideos = [];
        if (!err) {
          trendingVideos = JSON.parse(trendingVideosRes);
        }
        let topVideoReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_VIDEOS_LIST
        };
        getApisWithAuth(topVideoReqObj, function (err, topVideosRes) {
          var topVideos = [];
          if (!err) {
            topVideos = JSON.parse(topVideosRes);
          }
          let reviewsReqObj = {
            page: 1,
            perPage: 10,
            bearer,
            url: constants.API_REVIEW_LIST,
            itemId: videoId
          };
          getApisWithAuth(reviewsReqObj, function (err, reviewsResonse) {
            var reviews = {
              items: []
            };
            let reviewsRes = {};
            if (!err) {
              reviewsRes = JSON.parse(reviewsResonse);
              reviews = {
                imageBase: reviewsRes.userImageBase,
                items: reviewsRes.items || []
              }
            }
            video = video.toJSON();
            var favFilters = {
              status: 1,
              itemId: video.id,
              userId
            };
            Favourite.countDocuments(favFilters).then(isFav => {
              isFav = isFav ? true : false;
              var videoDetail = {
                id: video.id || null,
                title: video.title || null,
                image: video.image || null,
                youtubeId: video.youtubeId || null,
                description: video.description || null,
                durationSeconds: video.durationSeconds || null,
                viewCount: video.viewCount || null,
                averageRating: video.averageRating || null,
                maxRating: video.maxRating || null,
                tags: video.tags || [],
                publishedAt: video.publishedAt,
                sharingUrl: video.sharingUrl || null,
                isFav: isFav,
                imageBase: videosConfig.imageBase || null,
                userImageBase: userConfig.imageBase || null,
                reviews: reviews || [],
                topVideos: topVideos.items || [],
                trendingVideos: trendingVideos.items || []
              }

              res.send(videoDetail);

            });

          });
        });
      });
    });

  }

  exports.listAllCategories = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1,
      gradientStartColorHex: 1,
      gradientEndColorHex: 1,
      gradientAngleDegrees: 1
    };


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || videoCategoriesConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : videoCategoriesConfig.resultsPerPage;
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
    }

    VideoCategory.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(videoCategoriesList => {
      VideoCategory.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];

        var itemsCountCurrentPage = videoCategoriesList.length;
        for (i = 0; i < itemsCountCurrentPage; i++) {

          items.push({
            id: videoCategoriesList[i]._id,
            name: videoCategoriesList[i].name || null,
            image: videoCategoriesList[i].image || null,
            gradientStartColorHex: videoCategoriesList[i].gradientStartColorHex || null,
            gradientEndColorHex: videoCategoriesList[i].gradientEndColorHex || null,
            gradientAngleDegrees: videoCategoriesList[i].gradientAngleDegrees || null,
          });
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: videoCategoriesConfig.imageBase,
          items: items,
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



  exports.getSummary = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let topVideoReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_VIDEOS_LIST
    };
    getApisWithAuth(topVideoReqObj, function (err, topVideosRes) {

      var topVideos = {
        items: []
      };
      if (!err) {
        topVideos = JSON.parse(topVideosRes);
      }
      let topTrendingReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_VIDEOS_LIST,
        isTrending: true
      };
      getApisWithAuth(topTrendingReqObj, function (err, trendingVideosRes) {

        var trendingVideos = {
          items: []
        }
        if (!err) {
          trendingVideos = JSON.parse(trendingVideosRes);
        }
        let getCategoryReqObj = {
          page: 1,
          perPage: 5,
          bearer,
          url: constants.API_VIDEOS_CATEGORIES_LIST
        };
        getApisWithAuth(getCategoryReqObj, function (err, categoriesResult) {

          var categories = {
            items: []
          };
          if (!err) {
            categories = JSON.parse(categoriesResult);
          }
          let getAdsReqObj = {
            page: 1,
            perPage: 10,
            bearer,
            url: constants.API_ADS_LIST
          };
          getApisWithAuth(getAdsReqObj, function (err, adsResult) {

            var ads = {
              items: []
            };
            if (!err) {
              ads = JSON.parse(adsResult);
            }
            var adsSummary = {
              imageBase: ads.imageBase,
              totalItems: ads.totalItems,
              items: ads.items
            }
            var categoriesSummary = {
              imageBase: categories.imageBase,
              totalItems: categories.totalItems,
              items: categories.items
            }
            var topVideosSummary = {
              imageBase: trendingVideos.imageBase,
              items: topVideos.items
            }
            var trendingVideosSummary = {
              imageBase: topVideos.imageBase,
              items: trendingVideos.items
            }
            summary.quote = "Hello this is a dummy quote";
            summary.appAd = {
              imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
              image: "app-screen.png",
              playStoreButton: "play-store.png",
              appStoreButton: "app-store.png",
              title: "Download our Mobile app for better experience",
              description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, sit facere. Quasi dolorem odio magnam ratione. Ea quasi expedita fugit unde aut cum adipisci facilis culpa, maiores debitis assumenda perferendis."
            }
            summary.ads = adsSummary;
            summary.categories = categoriesSummary;
            summary.trendingVideos = trendingVideosSummary;
            summary.topVideos = topVideosSummary;
            res.send(summary)
            // }
          });
        });
      });

    });


  }


  exports.getSummaryForWeb = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let topVideoReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_VIDEOS_LIST
    };
    getApisWithAuth(topVideoReqObj, function (err, topVideosRes) {
      var topVideos = {
        items: []
      };
      if (!err) {
        topVideos = JSON.parse(topVideosRes);
      }
      let trendingVideoReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_VIDEOS_LIST,
        isTrending: true
      };
      getApisWithAuth(trendingVideoReqObj, function (err, trendingVideosRes) {
        var trendingVideos = {
          items: []
        }
        if (!err) {
          trendingVideos = JSON.parse(trendingVideosRes);
        }
        let getCategoryReqObj = {
          page: 1,
          perPage: 5,
          bearer,
          url: constants.API_VIDEOS_CATEGORIES_LIST
        };
        getApisWithAuth(getCategoryReqObj, function (err, categoriesResult) {
          var categories = {
            items: []
          };
          if (!err) {
            categories = JSON.parse(categoriesResult);
          }
          let getAdsReqObj = {
            page: 1,
            perPage: 10,
            bearer,
            url: constants.API_ADS_LIST
          };
          getApisWithAuth(getAdsReqObj, function (err, adsResult) {
            var ads = {
              items: []
            };
            if (!err) {
              ads = JSON.parse(adsResult);
            }
            var items = [];

            items.push({
              type: "category",
              title: "Categories",
              imageBase: categories.imageBase,
              items: categories.items,
              totalItems: categories.totalItems
            });
            items.push({
              type: "quote",
              title: "Quote",
              content: "Hello This is a dummmy quote"
            });
            items.push({
              type: "video",
              title: "Trending Videos",
              imageBase: trendingVideos.imageBase,
              items: trendingVideos.items,
              totalItems: trendingVideos.totalItems
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
              type: "video",
              title: "Top Videos",
              imageBase: topVideos.imageBase,
              items: topVideos.items,
              totalItems: topVideos.totalItems
            });
            items.push({
              type: "advertisement",
              title: "Advertisements",
              imageBase: ads.imageBase,
              items: ads.items,
              totalItems: ads.totalItems
            });
            summary = {
              items: items
            }
            res.send(summary);
          });
        });
      });

    });


  }

  exports.getVideoCategoryDetail = (req, res) => {

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
      name: 1,
      description: 1,
      image: 1
    }
    // get data
    Category.findOne(filters, queryProjection).then(videoCategory => {
      if (!videoCategory) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Category not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }


      res.send(videoCategory);

    });

  }
