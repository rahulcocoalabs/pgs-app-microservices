const Favourite = require('../models/favouriteTutor.model.js');
const Book = require('../models/book.model.js');
const Games = require('../models/game.model.js');
const Books = require('../models/book.model.js');
const Videos = require('../models/video.model.js');
const Products = require('../models/storeProduct.model.js');
const Charity = require('../models/charity.model.js');
const Test = require('../models/test.model')

var utilities = require('../components/utilities.component.js');
var config = require('../../config/app.config.js');
var favouritesConfig = config.favourites;
var moment = require('moment');


exports.addfavourite = async (req, res) => {

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;

    errors = [];
    if (!params.id) {
        errors.push({
            field: "tutorId",
            message: "tutorId  cannot be empty"
        });
    }

    if (errors.length) {
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }

    //return res.send(params.id);

    try {
        const newFavourite = new Favourite({
            userId: userId,
            tutorId: params.id,

            status: 1,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });

        var info = await newFavourite.save();



        // var update = await User.UpdateOne({ status: 1, _id: userId }, {
        //     $push: {
        //         favouriteTutor: params.id
        //     }

        // })
        // if (update && info) {
        //     return res.status(200).send({
        //         success: 1,
        //         message: "added to favourites"
        //     })
        // }
    }
    catch (error) {
        return res.status(201).send({
            success: 1,
            message:error.message
        })
    }

}


exports.removefavourite = async (req, res) => {

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.params;

    errors = [];
    if (!params.id) {
        errors.push({
            field: "tutorId",
            message: "tutorId  cannot be empty"
        });
    }

    if (errors.length) {
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }

    try {
        var update = await Favourite.updateOne({ status: 1, userId: userId,tutorId:params.id }, {
            status: 0
        })
        if (update) {
            return res.status(200).send({
                success: 1,
                message: "removed from favourites"
            })
        }
        else {
            return res.status(201).send({
                success: 1,
                message:"no such entity exists"
            })
        }
    }
    catch (error) {
        return res.status(201).send({
            success: 1,
            message:error.message
        })
    }

}


exports.addFav = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.query;

    errors = [];
    if (!params.itemId) {
        errors.push({
            field: "itemId",
            message: "itemId cannot be empty"
        });
    }
    if (!params.tutorId) {
        errors.push({
            field: "itemType",
            message: "itemType cannot be empty"
        });
    }
    if (!(favouritesConfig.itemTypes.indexOf(String(params.itemType)) > -1)) {
        errors.push({
            field: "itemType",
            message: "itemTypes should be one of the following -  " + favouritesConfig.itemTypes
        });
    }
    if (params.itemId && params.itemType != 'product') {

        var ObjectId = require('mongoose').Types.ObjectId;
        var isValidId = ObjectId.isValid(params.itemId);
        if (!isValidId)
            errors.push({
                field: "itemId",
                message: "itemId is not a valid object id"
            });
    }
    if (errors.length) {
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }

    Favourite.find({
        status: 1,
        itemId: params.itemId,
        itemType: params.itemType,
        userId: userId
    }, {
        id: 1
    }).then(favouritesList => {
        if (favouritesList.length) {
            res.send({
                success: 1,
                message: "Already in Favourites"
            });
            return;
        }

        const newFavourite = new Favourite({
            userId: userId,
            tutorId: params.tutorId,

            status: 1,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
        newFavourite.save()
            .then(data => {
                var formattedData = {
                    success: 1,
                    message: "Favourite Added..."
                };
                res.send(formattedData);
            }).catch(err => {
                res.status(500).send({
                    success: 0,
                    status: 500,
                    message: err.message || "Some error occurred while adding favourite."
                });
            });

    });

    //Check exist finish

}

exports.removeFav = (req, res) => {

    var params = req.body;


    var itemId = params.itemIds;
    if (!itemId) {
        var responseObj = {
            success: 0,
            status: 400,
            errors: [{
                field: "itemIds",
                message: "itemIds param is missing"
            }]
        }
        res.send(responseObj);
        return;
    }



    if (itemId.length) {
        Favourite.deleteMany({
            itemId: {
                $in: itemId
            }
        }, function (err, response) {
            if (!err) {
                var responseObj = {
                    success: 1,
                    message: "Items removed from favourites"
                }
                res.send(responseObj);
                return;
            }
            console.log(err);
            res.send({
                success: 0,
                message: "Error deleting items."
            });
            return;
        });
    } else {
        res.send({
            success: 0,
            message: "itemIds should be an array"
        });
    }

}
exports.getUserFavourites = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.query;
    if (!params.itemType) {
        res.send({
            success: 0,
            field: "itemType",
            message: "itemType is missing"
        });
        return;
    }

    var filters = {
        status: 1,
        userId: userId
    };
    var populate = [];
    type = params.itemType;
    if (type) {
        filters.itemType = type;
    }

    var queryProjection = {
        itemId: 1,
        itemType: 1,
        tsCreatedAt: 1,
        item: 1
    };
    var sortOptions = {};
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = params.perPage || favouritesConfig.resultsPerPage;
    var settings = {
        filters: filters,
        page: page,
        perPage: perPage,
        pagination: true,
        queryProjection: queryProjection,
        model: Favourite,
        returnPageData: true
    };
    utilities.getList(settings, async function (result) {
        defaultBook = {
            name: "The Alchemist",
            image: "13-b50971c35a0811f2210d326768c67095d68d0064.jpg",
            datePublished: "2004",
            averageRating: 4.1,
            maxRating: 5
        }
        defaultVideo = {
            title: "Tom & Jerry",
            image: "2-72c3dc8b56fb81a5a29b102fee6af81f93d16e91.jpg",
            publishedAt: "2012",
            averageRating: 4.9,
            maxRating: 5,
            durationSeconds: 285
        }
        defaultGame = {
            title: "Angry Cats",
            image: "game1-38f91a8d40ad3ac82178f601b36812dafde3682f.jpg",
            averageRating: 3.7,
            maxRating: 5
        }
        defaultProduct = {
            name: "Headphones",
            image: "catalog/1.jpg",
            averageRating: 3.6,
            maxRating: 5,
            originalPrice: 240,
            finalPrice: 199,
            originalId: 57
        }
        var i = 0;
        var len = result.items.length;
        var items = [];

        // while (i < len - 1) {
        await Promise.all(result.items.map(async (item) => {
            if (item.itemType == 'book') {
                let bookData = await Books.findOne({
                    _id: item.itemId
                });
                items.push({
                    id: item.itemId || "",
                    itemType: item.itemType || "",
                    time: item.time || "",
                    name: bookData.name,
                    image: bookData.image,
                    datePublished: bookData.datePublished,
                    averageRating: bookData.averageRating,
                    maxRating: 5
                });
            }
            if (item.itemType == 'video') {
                let videoData = await Videos.findOne({
                    _id: item.itemId
                })
                items.push({
                    id: result.items[i].itemId || "",
                    itemType: result.items[i].itemType || "",
                    time: result.items[i].time || "",
                    title: videoData.title,
                    image: videoData.image,
                    publishedAt: "2012",
                    averageRating: videoData.averageRating,
                    maxRating: videoData.maxRating,
                    durationSeconds: 285
                });
            }
            if (item.itemType == 'game') {
                let gamesData = await Games.findOne({
                    _id: item.itemId,
                });
                items.push({
                    id: item.itemId || "",
                    itemType: item.itemType || "",
                    time: item.time || "",
                    title: gamesData.title,
                    image: gamesData.image,
                    averageRating: gamesData.averageRating,
                    maxRating: gamesData.averageRating
                });
            }
            if (item.itemType == 'product') {
                let productData = await Products.findOne({
                    mysqlProductId: item.itemId
                })
                items.push({
                    id: item.itemId || "",
                    itemType: item.itemType || "",
                    time: item.time || "",
                    name: productData.name,
                    image: productData.image,
                    averageRating: 3.6,
                    maxRating: 5,
                    originalPrice: productData.originalPrice,
                    finalPrice: 199,
                    originalId: 57
                });
            }
            if (item.itemType == 'charity') {
                let chanrityData = await Charity.findOne({
                    _id: item.itemId
                })
                items.push({
                    id: item.itemId || "",
                    itemType: item.itemType || "",
                    time: item.time || "",
                    title: chanrityData.title,
                    image: chanrityData.image
                });
            }
            if (item.itemType == 'test') {
                let TestData = await Test.findOne({
                    _id: item.itemId
                })
                console.log(TestData)
                items.push({
                    id: item.itemId || "",
                    itemType: item.itemType || "",
                    time: item.time || "",
                    title: TestData ? TestData.title : null,
                    image: TestData ? TestData.image : null,
                    amount: TestData ? TestData.amount : null
                });
            }

            //   i++;

            // }
        }))
        // console.log(result);
        var responseObj = {
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            items: items || []
        }
        if (type && (favouritesConfig.itemTypes.indexOf(String(type) > -1))) {

            if (type == 'book') {
                responseObj.imageBase = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/images/books/covers/";
            }

            if (type == 'game') {
                responseObj.imageBase = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/images/games/images/";
            }

            if (type == 'video') {
                responseObj.imageBase = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/videos/images/";
            }

            if (type == 'product') {
                // responseObj.imageBase = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/store/products/";
                responseObj.imageBase = "http://172.104.61.150/edunet-ecommerce/image/"
            }
            if (type == 'charity') {
                responseObj.imageBase = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/images/charity/covers/";
            }
            if (type == 'test') {
                responseObj.imageBase = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/images/tests/covers/";
            }
        }


        res.send(responseObj);
        return;


    });
}
