var gateway = require('../components/gateway.component.js');
const User = require('../models/user.model.js');
const Nationality = require('../models/nationality.model.js');
const Advertisement = require('../models/advertisement.model.js');
const Feed1 = require('../models/feeds1.model.js');

const Coin = require('../models/coin.model');
const Language = require('../models/language.model');
const Contest = require('../models/contest.model');
var config = require('../../config/app.config.js');
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');

var feedsConfig = config.feeds;
var adsConfig = config.ads;
var usersConfig = config.users;
var emotionsConfig = config.emotions;
const contestsConfig = config.contests;
var moment = require("moment");
var ObjectId = require('mongoose').Types.ObjectId;


exports.getFeedSummary1 = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    const params = req.params;

    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    var feeds = await Feed1.find({ status: 1 }, {}, pageParams).catch(err => {
        return { success: 0, message: err.message }
    })

    if (feeds && feeds.succes && feeds.success === 0) {
        return res.send(feeds)
    }
    var array = [];
    for (x in feeds) {

        var objToClone = feeds[x];
        var objCopy = {

        };
        var emotionInfo = {
            userEmotion: null,
            total: 0,
            love: 0,
            happy: 0,
            heartfilled: 8,
            surprise: 0,
            sad: 0,
            angry: 0
        };
        var em = objToClone.emotions;
        for (y in em) {
            let emotion = em[y];
            if (userId == emotion.userId) {
                emotionInfo.userEmotion = emotion.emotion
            }
            if (emotion.emotion == 'happy') {
                emotionInfo.happy += 1;
            }
            if (emotion.emotion == 'love') {
                emotionInfo.love += 1;
            }
            if (emotion.emotion == 'heartfilled') {
                emotionInfo.heartfilled += 1;
            }
            if (emotion.emotion == 'surprise') {
                emotionInfo.surprise += 1;
            }
            if (emotion.emotion == 'sad') {
                emotionInfo.sad += 1;
            }
            if (emotion.emotion == 'angry') {
                emotionInfo.angry += 1;
            }
            emotion.total += 1;

        }
        var objCopy = JSON.parse(JSON.stringify(objToClone));
        objCopy.emotionInfo = emotionInfo;
        array.push(objCopy);

    }

    var ads = await Advertisement.find({ status: 1 }).catch(err => {
        return { success: 0, message: err.message }
    })
    if (ads && ads.success && ads.success == 0) {
        return res.send(ads)
    }

    let itemsCount = await array.length;//.countDocuments(filter);
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;

    let adsitemsCount = await ads.length;//.countDocuments(filter);
    var adstotalPages = itemsCount / perPage;
    adstotalPages = Math.ceil(totalPages);
    var adshasNextPage = page < totalPages;

    var feedsSummary = {
        imageBase: feedsConfig.imageBase,
        documentImage: feedsConfig.documentImage,
        videoBase: feedsConfig.videoBase,
        documentBase: feedsConfig.documentBase,
        authorImageBase: feedsConfig.authorImageBase,
        adsImageBase: adsResult.imageBase,
        totalItems: itemsCount,
        page: Number(req.params.page || 1),
        perPage: req.params.perPage || 30,
        hasNextPage: hasNextPage,
        totalPages: totalPages,
        items:array
      }

      var ads = {
       
            items: ads,
            imageBase: adsConfig.imageBase,
            page: Number(req.params.page) || 1,
            perPage: req.params.perPage || 30,
            hasNextPage: adshasNextPage,
            totalItems: adsitemsCount,
            totalPages: adstotalPages
   
      }

      const summary = {
          feeds:feedsSummary,
          ads:ads
      }

    // var feedsSummary = {
    //     imageBase: feedsConfig.imageBase,
    //     documentImage: feedsConfig.documentImage,
    //     videoBase: feedsConfig.videoBase,
    //     documentBase: feedsConfig.documentBase,
    //     authorImageBase: feedsConfig.authorImageBase,
    //     //adsImageBase: adsResult.imageBase,
    //     totalItems: itemsCount,
    //     page: Number(req.params.page),
    //     perPage: req.params.perPage,
    //     hasNextPage: hasNextPage,
    //     totalPages: totalPages,
    //     feeds: array,
    //     ads: {
    //         items: ads,
    //         imageBase: adsConfig.imageBase,
    //         page: Number(req.params.page),
    //         perPage: req.params.perPage,
    //         hasNextPage: adshasNextPage,
    //         totalItems: adsitemsCount,
    //         totalPages: adstotalPages
    //     },
    //     flag: 1
    // }
    return res.send(summary)
}