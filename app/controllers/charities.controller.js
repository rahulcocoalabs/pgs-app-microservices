var gateway = require('../components/gateway.component.js');
const Charity = require('../models/charity.model.js');
const BankAccount = require('../models/bankAccount.model.js');
const Favourite = require('../models/favourite.model.js');
var config = require('../../config/app.config.js');
const Users = require('../models/user.model.js');
const CharityDonate = require('../models/charityDonation.model.js');
const constants = require('../helpers/constants');
var moment = require('moment');
var charitiesConfig = config.charities;
var eventsConfig = config.events;

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

  exports.listAll = (req, res) => {
    var filters = {
      status: 1,
      isOpen: true
    };
    var queryProjection = {
      title: 1,
      image: 1
    };


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charitiesConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charitiesConfig.resultsPerPage;
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


    Charity.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(charitiesList => {
      Charity.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];
        console.log(charitiesList);
        var len = charitiesList.length;
        while (i < len) {

          items.push({
            id: charitiesList[i]._id || "",
            title: charitiesList[i].title || "",
            image: charitiesList[i].image || ""
          });
          i++;
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: charitiesConfig.imageBase,
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

  exports.getCharityDetail = (req, res) => {
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
      status: 1,
      isOpen: true
    }
    var queryProjection = {
      _id: 1,
      title: 1,
      description: 1,
      amountNeeded: 1,
      amountCollected: 1,
      image: 1,
      bankAccountId: 1,
      bankAccount: 1,
      banners: 1,
      attributesList: 1,
      isFav: 1
    }
    // get data
    Charity.findOne(filters, queryProjection).populate('bankAccount').then(charity => {
      if (!charity) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Charity not found with id"
          }]
        }

        res.send(responseObj);
        return;
      }
      var item = {
        id: charity.id || "",
        title: charity.title || "",
        description: charity.description || "",
        amountNeeded: charity.amountNeeded || "",
        amountCollected: charity.amountCollected || "",
        imageBase: charitiesConfig.imageBase || "",
        image: charity.image || "",
        bankAccount: charity.bankAccount || {},
        banners: charity.banners || "",
        attributesList: charity.attributesList || [],
        isFav: charity.isFav
      }
      res.send(item);

    });

  }

  exports.getSummary = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let charitiesReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_CHARITIES
    };

    getApisWithAuth(charitiesReqObj, function (err, charitiesResult) {
      var charities = {
        items: []
      };
      if (!err) {
        var charitiesResultObj = JSON.parse(charitiesResult);
        charities = {
          imageBase: charitiesConfig.imageBase,
          items: charitiesResultObj.items
        }
      }
      let eventsReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_EVENTS_LISTING
      };
      getApisWithAuth(eventsReqObj, function (err, eventsResult) {
        var events = {
          items: []
        }
        if (!err) {
          var eventsResultObj = JSON.parse(eventsResult);
          events = {
            imageBase: eventsConfig.imageBase,
            items: eventsResultObj.items
          }
        }
        let adsReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_ADS_LIST
        };
        getApisWithAuth(adsReqObj, function (err, adsResult) {
          var ads = {
            items: []
          };
          if (!err) {
            ads = JSON.parse(adsResult);
            var appAd = {
              imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
              image: "app-screen.png",
              playStoreButton: "play-store.png",
              appStoreButton: "app-store.png",
              title: "Download our Mobile app for better experience",
              description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, sit facere. Quasi dolorem odio magnam ratione. Ea quasi expedita fugit unde aut cum adipisci facilis culpa, maiores debitis assumenda perferendis."
            }
            var summary = {
              charities: charities,
              events: events,
              ads: ads,
              appAd: appAd

            }
            res.send(summary);
          }
        });
      });
    });
  }

  exports.getSummaryForWeb = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let charitiesReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_CHARITIES
    };
    getApisWithAuth(charitiesReqObj, function (err, charitiesResult) {
      var charities = {
        items: []
      };
      var charitiesResultObj = JSON.parse(charitiesResult);
      if (!err) {
        charities = {
          imageBase: charitiesConfig.imageBase,
          items: charitiesResultObj.items,
          totalItems: charitiesResultObj.totalItems
        }
      }
      let eventsReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_EVENTS_LISTING
      };
      getApisWithAuth(eventsReqObj, function (err, eventsResult) {
        var events = {
          items: []
        }
        if (!err) {
          events = JSON.parse(eventsResult);
        }
        let adsReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_ADS_LIST
        };
        getApisWithAuth(adsReqObj, function (err, adsResult) {
          var ads = {
            items: []
          };
          if (!err) {
            ads = JSON.parse(adsResult);

            var items = [];

            items.push({
              type: "charity",
              title: "Suggestions",
              imageBase: charities.imageBase,
              items: charities.items,
              totalItems: charities.totalItems
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
              type: "event",
              title: "Events",
              imageBase: events.imageBase,
              items: events.items,
              totalItems: events.totalItems
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
          }
        });
      });
    });
  }

  exports.donateCoins = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    params.charityId = req.params.id;
    if (!params.coins || !params.charityId) {
      errors = [];
      if (!params.charityId) {
        errors.push({
          field: "Charity Id",
          message: "Charity Id cannot be empty"
        });
      }
      if (!params.coins) {
        errors.push({
          field: "Coins",
          message: "Coins cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    var filters = {
      _id: userId
    }
    Users.findOne(filters).then(result => {
      var coinCount = result ? result.coinCount : 0
      if (parseInt(coinCount) == 0) {
        res.send({
          success: 0,
          status: 200,
          message: "There are no coins to donate"
        })
      } else {
        if (params.coins <= coinCount) {
          const newDonation = new CharityDonate({
            userId: userId,
            charityId: params.charityId,
            amount: params.coins,
            status: 1,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
          });
          newDonation.save()
            .then(data => {
              var formattedData = {
                success: 1,
                message: "Coins donated successfully"
              };
              res.send(formattedData);
              var updatedCoinCount = result.coinCount - params.coins;
              var updateFilter = {
                _id: userId,
              }
              var updateField = {
                coinCount: updatedCoinCount
              }
              Users.updateOne(updateFilter, updateField).then(result => {})
            }).catch(err => {
              res.status(500).send({
                success: 0,
                status: 500,
                message: err.message || "Some error occurred while donating coins."
              });
            });
        } else {
          res.send({
            success: 0,
            status: 200,
            message: "Donated coins should be less than actual coins count"
          })
        }
      }

    })

  }

