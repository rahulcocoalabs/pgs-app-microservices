const Contests = require('../models/contest.model');
const Feeds = require('../models/feed.model');
const Users = require('../models/user.model.js');
const config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const contestsConfig = config.contests;
const feedsConfig = config.feeds;
const usersConfig = config.users;
const InnovationChallenge = require('../models/innovationChallenge.model');
const ObjectId = require('mongoose').Types.ObjectId;

// *** List all contests ***
exports.listAll = async (req, res) => {
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || contestsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : contestsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    try {
        let filter = {
            isResultAnnounced : false,
            status: 1
        };
        // let projection = {
        //     title: 1,
        //     place: 1,
        //     image: 1,
        //     fromDate: 1,
        //     toDate: 1
        // };
        let contestList = await Contests.find(filter).skip(offset).limit(perPage);
        // let contestList = await Contests.find(filter, projection).skip(offset).limit(perPage);
        let itemsCount = await Contests.countDocuments(filter);
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page: page,
            perPage: perPage,
            hasNextPage: hasNextPage,
            totalItems: itemsCount,
            totalPages: totalPages
        };
        res.status(200).send({
            success: 1,
            imageBase: contestsConfig.imageBase,
            pagination: pagination,
            items: contestList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: 'something went wrong while listing contests'
        })
    }
}

// *** Contest detail ***
exports.detail = async (req, res) => {
    let id = req.params.id;
    let data = req.identity.data;
    let userId = data.userId;
    var isValidId = ObjectId.isValid(id);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.status(400).send(responseObj);
        return;
    }
    try {
        let filter = {
            _id: id,
            status: 1
        };
        let projection = {
            title: 1,
            description: 1,
            place: 1,
            image: 1,
            fromDate: 1,
            toDate: 1,
            aboutContest : 1
        };
        let contestDetail = await Contests.findOne(filter, projection);

        let contestId = contestDetail.id;
        var count = 0
        var isApplied = false ;
        count = await InnovationChallenge.countDocuments({status:1,userId:userId,contestId:id});
        if (count >= 1){
            isApplied = true;
        }
        res.status(200).send({
            success: 1,
            imageBase: contestsConfig.imageBase,
            item: contestDetail,
            isApplied: isApplied
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: 'something went wrong while fetching details',
            error:err.message
        })
    }
}

// *** Contest history ***


exports.listContestHistory = async(req,res) => {

    var userData = req.identity.data;
    var userId = userData.userId;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || contestsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : contestsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    var findCriteria = {
        userId: userId,
       
        status: 1
    }

    var projection = {contestId:1};

    var data = await InnovationChallenge.find(findCriteria,projection).catch(err=>{return {success:0,message:err.message}});

    if (data && data.success != undefined && data.success === 0){
        return res.send(data);
    }

    if (data.count === 0){

        var pagination = {
            page,
            perPage,
            hasNextPage:false,
            totalItems: 0,
            totalPages:0,
        };

        return res.send({
            success: 1,
            pagination,
            contestImageBase: contestsConfig.imageBase,
            imageBase: feedsConfig.imageBase,
            documentImage: feedsConfig.documentImage,
            videoBase: feedsConfig.videoBase,
            documentBase: feedsConfig.documentBase,
            items: data,
            message: 'contest history list'
        })
    }
    else {

        var ids = [];

        for (x in data){
            var item = data[x];
            var id = item.contestId;
            ids.push(ObjectId(id));
            
        }

        var filter = {
            status:1,
            _id:{$in:{ids}}
        }

        var contests = await Contests.find(filter).catch(err=>{return { success: 0, message: err.message}})

        if (contests && contests.success != undefined && contests.success === 0){
            return res.send(contests);
        }

        var totalPages = contests.length / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page,
            perPage,
            hasNextPage,
            totalItems: totalContestHistoryCount,
            totalPages,
        };

        return res.send({
            success: 1,
            pagination,
            contestImageBase: contestsConfig.imageBase,
            imageBase: feedsConfig.imageBase,
            documentImage: feedsConfig.documentImage,
            videoBase: feedsConfig.videoBase,
            documentBase: feedsConfig.documentBase,
            items: contests,
            message: 'contest history list'
        })


    }



}

exports.listContestHistory1 = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || contestsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : contestsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var findCriteria = {
        authorUserId: userId,
        feedType: constants.CONTEST_TYPE,
        status: 1
    }
    var contestData = await Feeds.find(findCriteria)
        .populate('contest')
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing contest history',
                error: err
            }
        })
    if (contestData && (contestData.success !== undefined) && (contestData.success === 0)) {
        return res.send(contestData);
    }

    let totalContestHistoryCount = await Feeds.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting total contest history count',
                error: err
            }
        })
    if (totalContestHistoryCount && totalContestHistoryCount.success && (totalContestHistoryCount.success === 0)) {
        return res.send(totalContestHistoryCount);
    }

    var totalPages = totalContestHistoryCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalContestHistoryCount,
        totalPages,
    };
    return res.send({
        success: 1,
        pagination,
        contestImageBase: contestsConfig.imageBase,
        imageBase: feedsConfig.imageBase,
        documentImage: feedsConfig.documentImage,
        videoBase: feedsConfig.videoBase,
        documentBase: feedsConfig.documentBase,
        items: contestData,
        message: 'contest history list'
    })

}
// *** Announced contest ***
exports.listResultAnnouncedContest = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || contestsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : contestsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var findCriteria = {
        isResultAnnounced: true,
        status: 1
    }
    var resultAnnouncedContestData = await Contests.find(findCriteria)
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing result announced contest',
                error: err
            }
        })
    if (resultAnnouncedContestData && (resultAnnouncedContestData.success !== undefined) && (resultAnnouncedContestData.success === 0)) {
        return res.send(resultAnnouncedContestData);
    }

    var totalResultAnnouncedContestCount = await Contests.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting total result announced contest count',
                error: err
            }
        })
    if (totalResultAnnouncedContestCount && totalResultAnnouncedContestCount.success && (totalResultAnnouncedContestCount.success === 0)) {
        return res.send(totalResultAnnouncedContestCount);
    }

    var totalPages = totalResultAnnouncedContestCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalResultAnnouncedContestCount,
        totalPages,
    };
    return res.send({
        success: 1,
        pagination,
        contestImageBase: contestsConfig.imageBase,
        items: resultAnnouncedContestData,
        message: 'Result announced contest list'
    })
}

// *** get leader board ***
exports.getLeaderBoard = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var contestId = req.params.id;
    var findCriteria = {
        _id: contestId,
        isResultAnnounced: true,
        status: 1
    }
    var checkContest = await Contests.find(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while check contest',
                error: err
            }
        })
    if (checkContest && (checkContest.success !== undefined) && (checkContest.success === 0)) {
        return res.send(checkContest);
    }
    if (checkContest) {
        findCriteria = {
            feedType: constants.CONTEST_TYPE,
            contest: contestId,
            status: 1
        }
        findCriteria.rank = {
            $lte: constants.FINAL_RANK
        }
        var leaderBoardList = await Feeds.find(findCriteria)
            .populate([{
                path: 'authorUser',
                select: { firstName: 1, middlename: 1, lastName: 1, coinCount: 1, image: 1 }
            }, {
                path: 'contest',
                select: { title: 1, description: 1, image: 1 }
            }
            ])
            .limit(perPage)
            .skip(offset)
            .sort({
                'rank': 1
            })
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while listing leader board',
                    error: err
                }
            })
        if (leaderBoardList && (leaderBoardList.success !== undefined) && (leaderBoardList.success === 0)) {
            return res.send(leaderBoardList);
        }
        leaderBoardList = JSON.parse(JSON.stringify(leaderBoardList))




        var leaderBoardCount = await Feeds.countDocuments(findCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting leaderboard count',
                    error: err
                }
            })
        if (leaderBoardCount && leaderBoardCount.success && (leaderBoardCount.success === 0)) {
            return res.send(leaderBoardCount);
        }

        findCriteria.authorUserId = userId;

        var authorWinnerData = await Feeds.findOne(findCriteria)
            .populate([{
                path: 'authorUser',
                select: { firstName: 1, middlename: 1, lastName: 1, coinCount: 1, image: 1 }
            }, {
                path: 'contest',
                select: { title: 1, description: 1, image: 1 }
            }
            ])
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting author winner',
                    error: err
                }
            })
        if (authorWinnerData && (authorWinnerData.success !== undefined) && (authorWinnerData.success === 0)) {
            return res.send(authorWinnerData);
        }
        if (authorWinnerData) {
            for (let i = 0; i < leaderBoardList.length; i++) {
                var winnerObj = leaderBoardList[i];
                var authorUserId = JSON.stringify(winnerObj.authorUser.id);
                if (JSON.stringify(userId) === authorUserId) {
                    leaderBoardList[i].isAuthor = true;
                } else {
                    leaderBoardList[i].isAuthor = false;
                }
            }
        } else {
            for (let i = 0; i < leaderBoardList.length; i++) {
                leaderBoardList[i].isAuthor = false;
            }
        }


        var totalPages = leaderBoardCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page,
            perPage,
            hasNextPage,
            totalItems: leaderBoardCount,
            totalPages,
        };
        return res.send({
            success: 1,
            pagination,
            contestImageBase: contestsConfig.imageBase,
            usersImageBase: usersConfig.imageBase,
            items: leaderBoardList,
            authorWinnerData: authorWinnerData,
            message: 'Leader board list'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Invalid contest'
        })
    }
}