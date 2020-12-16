var gateway = require('../components/gateway.component.js');
const User = require('../models/user.model.js');
const Nationality = require('../models/nationality.model.js');

const Feed1 = require('../models/feeds1.model.js');

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


exports.getFeedSummary1 = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;

    var feeds = await Feed1.find({ status: 1 }).catch(err => {
        return { success: 0, message: err.message }
    })
    var array = [];
    for (x in feeds) {
       
        var objToClone = feeds[x];
        var objCopy = {};

        var objCopy = JSON.parse( JSON.stringify( objToClone ) );
        objCopy[flag] = 1;
        array.push(objCopy);

    }

    var feedsSummary = {
        imageBase: feedsConfig.imageBase,
        documentImage: feedsConfig.documentImage,
        videoBase: feedsConfig.videoBase,
        documentBase: feedsConfig.documentBase,
        authorImageBase: feedsConfig.authorImageBase,
        //adsImageBase: adsResult.imageBase,
        totalItems: feeds.totalItems,
        // page: Number(req.params.page),
        // perPage: feeds.perPage,
        // hasNextPage: feeds.hasNextPage,
        //totalPages: feeds.totalPages,
        items: array,
        flag:1
    }
    return res.send(feedsSummary)
}