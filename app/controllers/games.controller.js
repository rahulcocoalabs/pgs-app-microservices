var gateway = require('../components/gateway.component.js');

const Game = require('../models/game.model.js');
const GameCategory = require('../models/gameCategory.model.js');
var config = require('../../config/app.config.js');
const Favourite = require('../models/favourite.model.js');
const constants = require('../helpers/constants');

var gamesConfig = config.games;
var gameCategoriesConfig = config.gameCategories;
/* ********** Functions ********** */

function getApisWithAuth(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  gateway.getWithAuth(url, reqObj, bearer, function (err, result) {
    if (err) {
      console.log("Error fetching games ..." + url);
    }
    callback(err, result);
  });

};


exports.listAllGames = (req, res) => {
  console.log("inside listAllGames")
  var filters = {
    status: 1
  };
  var queryProjection = {
    title: 1,
    image: 1,
    averageRating: 1,
    maxRating: 1
  };


  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || gamesConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : gamesConfig.resultsPerPage;
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
    sortOptions.tsCreatedAt = -1
  }
  if (params.isTrending) {
    filters.isTrending = true;
  }

  if(params.categoryId) {
    filters.gameCategoryIds = [params.categoryId];
  }

  Game.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(gamesList => {
    Game.countDocuments(filters, function (err, itemsCount) {
      var i = 0;
      var items = [];

      var itemsCountCurrentPage = gamesList.length;
      for (i = 0; i < itemsCountCurrentPage; i++) {
        //rakesh doubt
        items.push({
          id: gamesList[i]._id,
          title: gamesList[i].title || null,
          image: gamesList[i].image || null,
          averageRating: gamesList[i].averageRating || null,
          maxRating: gamesList[i].maxRating || null
        });
      }
      totalPages = itemsCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;
      var responseObj = {
        imageBase: gamesConfig.imageBase,
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

// added by rakesh 

exports.didClickDownloadButton = async (req, res) => {

  if (!req.params){
    return res.status(500).json({ message: "add params in request", success:0})
  }
  if (!req.params.id){
    return res.status(500).json({ message: "add id in params  in request", success:0})
  }

  try {
    var response = await Game.updateOne({ status: 1, _id: req.params.id }, { $inc: { viewCount: 1 } });

    if (response){
      return res.status(200).json({
        success: 1,
        message:"count increased successfully"
      })
    }

  }
  catch (error) {

      return res.status(500).json({ message: error.message, success:0})
  }

}

exports.getGameDetail = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var id = req.params.id;
  let bearer = req.headers['authorization'];

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
    categories: 1,
    image: 1,
    banners: 1,
    playStroreUrl: 1,
    videoYoutubeId: 1,
    appStoreUrl: 1,
    description: 1,
    viewCount: 1,
    averageRating: 1,
    maxRating: 1,
    tags: 1,
    isFav: 1
  }
  // get data
  Game.findOne(filters, queryProjection).populate('categories').then(game => {
    if (!game) {
      var responseObj = {
        success: 0,
        status: 200,
        errors: [{
          field: "id",
          message: "Game not found with id"
        }]
      }
      res.send(responseObj);
      return;
    }
    gameId = id;
    let relatedGameReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_GAMES_LIST,
    };
    getApisWithAuth(relatedGameReqObj, function (err, relatedGamesResObj) {
      var relatedGames = {
        items: []
      };

      if (!err) {
        relatedGamesRes = JSON.parse(relatedGamesResObj)
        relatedGames = relatedGamesRes.items || [];
      }
      let reviewsReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_REVIEW_LIST,
        itemId: gameId
      };
      // { page: 1, perPage: perPage, itemId: itemId }
      getApisWithAuth(reviewsReqObj, function (err, reviewsResObj) {
        var reviews = {
          items: []
        };
        var reviewsRes = {
          items: []
        };
        if (!err) {
          reviewsRes = JSON.parse(reviewsResObj);
          reviews = {
            imageBase: reviewsRes.imageBase,
            items: reviewsRes.items || []
          }
        }
        var favFilters = {
          status: 1,
          itemId: game.id,
          userId: userId
        };
        Favourite.countDocuments(favFilters).then(isFav => {
          isFav = isFav ? true : false;

          var gameDetail = {
            id: game.id || null,
            title: game.title || null,
            image: game.image || null,
            description: game.description || null,
            playStoreUrl: game.playStoreUrl || null,
            videoYoutubeId: game.videoYoutubeId || null,
            appStoreUrl: game.appStoreUrl || null,
            viewCount: game.viewCount || null,
            averageRating: game.averageRating || null,
            maxRating: game.maxRating || null,
            banners: game.banners || [],
            tags: game.tags || [],
            sharingUrl: game.sharingUrl || null,
            isFav: isFav,
            reviews: reviews || [],
            relatedGames: relatedGames || [],
            imageBase: gamesConfig.imageBase || null,
            bannerImageBase: gamesConfig.bannersImageBase || null
          }
          res.send(gameDetail);

        });
      });
    });
  });

}


exports.getSummary = (req, res) => {
  var summary = {};
  let bearer = req.headers['authorization'];
  let recommendedGameReqObj = {
    page: 1,
    perPage: 10,
    bearer,
    url: constants.API_GAMES_LIST,
  };
  getApisWithAuth(recommendedGameReqObj, function (err, gamesResult) {
    var games = {
      items: []
    };
    if (!err) {
      games = JSON.parse(gamesResult);
    }
    let gameCategoryReqObj = {
      page: 1,
      perPage: 5,
      bearer,
      url: constants.API_GAMES_CATEGORIES,
    };
    getApisWithAuth(gameCategoryReqObj, function (err, categoriesResult) {
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
        let adsSummary = {}
        if (!err) {
          ads = JSON.parse(adsResult);

          adsSummary = {
            imageBase: ads.imageBase,
            totalItems: ads.totalItems,
            items: ads.items
          }
        }
        var categoriesSummary = {
          imageBase: categories.imageBase,
          totalItems: categories.totalItems,
          items: categories.items
        }
        var gamesSummary = {
          imageBase: games.imageBase,
          totalItems: games.totalItems,
          items: games.items
        }
        summary.banners = {
          imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
          images: ["game-banner-1.png", "game-banner-2.png", "game-banner-3.png"]
        }
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
        summary.newGames = gamesSummary;
        summary.recommendedGames = gamesSummary;
        res.send(summary);

      });

    });
  });


}
exports.getSummaryForWeb = (req, res) => {
  var summary = {};
  let bearer = req.headers['authorization'];
  let recommendedGameReqObj = {
    page: 1,
    perPage: 10,
    bearer,
    url: constants.API_GAMES_LIST,
  };
  getApisWithAuth(recommendedGameReqObj, function (err, gamesResult) {
    var games = {
      items: []
    };
    if (!err) {
      games = JSON.parse(gamesResult);
    }
    let gameCategoryReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_GAMES_CATEGORIES,
    };
    getApisWithAuth(gameCategoryReqObj, function (err, categoriesResult) {
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
          type: "game",
          title: "Suggested Games",
          imageBase: games.imageBase,
          items: games.items,
          totalItems: games.totalItems
        });
        items.push({
          type: "banner",
          title: "Banners",
          imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
          items: [{
            image: "banner-1.png",
            link: "appstore.com/game1"
          }, {
            image: "banner-2.png",
            link: "appstore.com/game2"
          }]
        });

        items.push({
          type: "game",
          title: "Top Games",
          imageBase: games.imageBase,
          items: games.items,
          totalItems: games.totalItems
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
          type: "game",
          title: "Trending Games",
          imageBase: games.imageBase,
          items: games.items,
          totalItems: games.totalItems
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
  var perPage = Number(params.perPage) || gameCategoriesConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : gameCategoriesConfig.resultsPerPage;
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

  GameCategory.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(gameCategoriesList => {
    GameCategory.countDocuments(filters, function (err, itemsCount) {
      var i = 0;
      var items = [];

      var itemsCountCurrentPage = gameCategoriesList.length;
      for (i = 0; i < itemsCountCurrentPage; i++) {
        items.push({
          id: gameCategoriesList[i]._id,
          name: gameCategoriesList[i].name || null,
          image: gameCategoriesList[i].image || null,
          gradientStartColorHex: gameCategoriesList[i].gradientStartColorHex || null,
          gradientEndColorHex: gameCategoriesList[i].gradientEndColorHex || null,
          gradientAngleDegrees: gameCategoriesList[i].gradientAngleDegrees || null,
        });
      }
      totalPages = itemsCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;
      var responseObj = {
        imageBase: gameCategoriesConfig.imageBase,
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

exports.getGameCategoryDetail = (req, res) => {

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
  GameCategory.findOne(filters, queryProjection).then(gameCategory => {
    if (!gameCategory) {
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


    res.send(gameCategory);

  });

}

