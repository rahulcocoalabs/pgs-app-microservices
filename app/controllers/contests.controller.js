const Contests = require('../models/contest.model');
const Feeds = require('../models/feed.model');
const contestItem = require('../models/contestItem.model');
const Users = require('../models/user.model.js');
const config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const contestsConfig = config.contests;
const feedsConfig = config.feeds;
const usersConfig = config.users;
const InnovationChallenge = require('../models/innovationChallenge.model');
const contestSynopsis = require('../models/contestSynopsis.model');
const ObjectId = require('mongoose').Types.ObjectId;
var moment = require("moment");

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
            isResultAnnounced: false,
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
            imageBase: contestsConfig.contestImageBase,
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
            type: 1,
            uploadFileType: 1,
            fromDate: 1,
            toDate: 1,
            aboutContest: 1
        };
        let contestDetail = await Contests.findOne(filter, projection);

        // let contestId = contestDetail.id;
        var count = 0
        var isApplied = false;
        count = await InnovationChallenge.countDocuments({ status: 1, userId: userId, contestId: id });
        if (count >= 1) {
            isApplied = true;
        }

        count = await contestSynopsis.countDocuments({ status: 1, userId: userId, contestId: id });
        if (count >= 1) {
            isApplied = true;
        }
        res.status(200).send({
            success: 1,
            imageBase: contestsConfig.contestImageBase,
            item: contestDetail,
            isApplied: isApplied
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: 'something went wrong while fetching details',
            error: err.message
        })
    }
}

// *** Contest history ***


exports.listContestHistory = async (req, res) => {

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

    var projection = { contestId: 1 };

    var data1 = await InnovationChallenge.find(findCriteria, projection).catch(err => { return { success: 0, message: err.message } });


    if (data1 && data1.success != undefined && data1.success === 0) {

        return res.send(data1);
    }

    var data2 = await InnovationChallenge.find(findCriteria, projection).catch(err => { return { success: 0, message: err.message } });


    if (data2 && data2.success != undefined && data2.success === 0) {

        return res.send(data2);
    }

    const data = data1 + data2;
    console.log(' <------------------------------------>');
    console.log(data1);
    console.log(data2);
    console.log(data);

    if (data.count === 0) {

        var pagination = {
            page,
            perPage,
            hasNextPage: false,
            totalItems: 0,
            totalPages: 0,
        };

        return res.send({
            success: 1,
            pagination,
            contestImageBase: contestsConfig.contestImageBase,
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

        for (x in data) {
            var item = data[x];
            var id = item.contestId;


            ids.push(ObjectId(id));

        }


        var filter = {
            status: 1,

            _id: { $in: ids }
        }


        var projection1 = { image: 1, status: 1, toDate: 1, fromDate: 1, title: 1, description: 1 };

        var contests = await Contests.find(filter, projection1)
            .limit(perPage)
            .skip(offset)
            .sort({
                'tsCreatedAt': -1
            }).catch(err => { return { success: 0, message: err.message } })

        if (contests && contests.success != undefined && contests.success === 0) {
            return res.send(contests);
        }

        var contestsLen = await Contests.countDocuments(filter).catch(err => { return { success: 0, message: err.message } })

        if (contestsLen && contestsLen.success != undefined && contestsLen.success === 0) {
            return res.send(contestsLen);
        }

        var totalPages = contestsLen / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page,
            perPage,
            hasNextPage,
            totalItems: contestsLen,
            totalPages,
        };

        return res.send({
            success: 1,
            pagination,

            imageBase: contestsConfig.contestImageBase,

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
        contestImageBase: contestsConfig.contestImageBase,
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
        contestImageBase: contestsConfig.contestImageBase,
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
            contestImageBase: contestsConfig.contestImageBase,
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

exports.addContestItem = async (req, res) => {

    console.log("ok1")

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    var files = req.files;
    
    if (!params.title || !params.type || !params.contestId) {
        errors = [];
        if (!params.title) {
            errors.push({
                field: "title",
                message: "Title cannot be empty"
            });
        }
        if (!params.type) {
            errors.push({
                field: "Type",
                message: " type cannot be empty"
            });
        }
        if (!params.contestId) {
            errors.push({
                field: "contest ID",
                message: " contest ID cannot be empty"
            });
        }
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }


    var type = req.body.type || null;
    var images = [];
    var documents = [];
    var video = null;
   
        if (req.files.images && !req.files.video && !req.files.documents) {

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
    

   

    try {
       
        const contestItems = new contestItem({
            title: params.title,
            feedType: params.feedType,
            contestId:params.contestId,
            description: params.description || null,
            images: images || [],
            video: video || null,
            files: documents || [],
            type: type,
            contest: params.contestId || null,
            
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
       
        let saveFeed = await contestItems.save();
       
        res.status(200).send({
            success: 1,
            message: "Item Posted Successfully"
        });
    } catch (err) {
        res.status(500).send({
          success: 0,
          message: 'Something went wrong while uploading',
          error:err.message
        })
       
    }


}

exports.addSynopsis = async(req, res) => {

    

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;

    if (!params.title || !params.synopsis || !params.contestId || !params.type ) {
        
        errors = [];
        if (!params.title) {
            errors.push({
                field: "title",
                message: "Title cannot be empty"
            });
        }
        if (!params.synopsis) {
            errors.push({
                field: "synopsis",
                message: " synopsis cannot be empty"
            });
        }
        if (!params.type) {
            errors.push({
                field: "Type",
                message: " type cannot be empty"
            });
        }
        if (!params.contestId) {
            errors.push({
                field: "contest ID",
                message: " contest ID cannot be empty"
            });
        }
       
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }

    var files = req.files;
    var type = req.body.type || null;
    var images = "";
    var documents = "";
    var video = "";
    console.log('1')
        if (req.files.images && !req.files.video && !req.files.documents) {

            type = "image";
            var len = files.images.length;
            var i = 0;
            // while (i < len) {
            //     images.push(files.images[i].filename);
            //     i++;
            // }
            images = files.images[0].filename;
            console.log('2',files.images);
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
            console.log('3')
        }
        if (!req.files.images && !req.files.video && req.files.documents) {
            type = "document";
            var len = files.documents.length;
            var i = 0;
            // while (i < len) {
            //     documents.push(files.documents[i].filename);
            //     i++;
            // }
            documents =  files.documents[0].filename;
            console.log('4')

        }
        if (!req.files.images && !req.files.video && !req.files.documents) {
            type = "text";
            console.log('5')
        }
    

    try {
       
        const contestItems = new contestSynopsis({
            title: params.title,
            synopsis: params.synopsis,
            userId:userId,
            type:type,
            images:images,
            documents:documents,
            video:video,
            status:1,
            contestId: params.contestId || null,
            type:params.type,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
       
        let saveFeed = await contestItems.save();
       
        res.status(200).send({
            success: 1,
            message: "Item Posted Successfully"
        });
    } catch (err) {
        res.status(500).send({
          success: 0,
          message: 'Something went wrong while uploading',
          error:err.message
        })
       
    }
}

exports.addContestInnovation = async (req, res) => {

    

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    
    console.log(params,"06/05");
    
    if (!params.title || !params.estimate || !params.contestId || !params.description) {
        errors = [];
        if (!params.title) {
            errors.push({
                field: "title",
                message: "Title cannot be empty"
            });
        }
        if (!params.estimate) {
            errors.push({
                field: "estimate",
                message: " estimate cannot be empty"
            });
        }
        if (!params.contestId) {
            errors.push({
                field: "contest ID",
                message: " contest ID cannot be empty"
            });
        }
        if (!params.description) {
            errors.push({
                field: "description ID",
                message: " description ID cannot be empty"
            });
        }
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }


   
       
    

   

    try {
       
        const contestItems = new contestItem({
            title: params.title,
            estimate: params.estimate,
            contestId:params.contestId,
            projectBrief: params.description ,
           
            contest: params.contestId || null,
            
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
       
        let saveFeed = await contestItems.save();
       
        res.status(200).send({
            success: 1,
            message: "Item Posted Successfully"
        });
    } catch (err) {
        res.status(500).send({
          success: 0,
          message: 'Something went wrong while uploading',
          error:err.message
        })
       
    }


}