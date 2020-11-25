const Favourite = require('../models/favouriteTutor.model.js');
const Class = require('../models/favouriteClass.model.js');
const User = require('../models/user.model.js');
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
var mongoose = require('mongoose');


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
    var id = mongoose.Types.ObjectId(params.id);
    try {
        const newFavourite = new Favourite({
            userId: userId,
            tutorId: params.id,

            status: 1,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
        console.log(newFavourite);
        var info = await newFavourite.save();



        var update = await User.updateOne({ status: 1, _id: userId }, {
            $push: {
                favouriteTutor: params.id
            }

        })
        if (info && update) {
            return res.status(200).send({
                update,
                success: 1,
                message: "tutor added to your favourites"
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







exports.addfavouriteClass = async (req, res) => {

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
    var id = mongoose.Types.ObjectId(params.id);
    try {
        const newClass = new Class({
            userId: userId,
            classId: params.id,

            status: 1,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
        console.log(newClass);
        var info = await newClass.save();



        // var update = await User.UpdateOne({ status: 1, _id: userId }, {
        //     $push: {
        //         favouriteTutor: params.id
        //     }

        // })
        if (info) {
            return res.status(200).send({
                success: 1,
                message: "tutor added to your favourites"
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


exports.removefavouriteClass = async (req, res) => {

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
    console.log(userId,params.id)
    try {
        var update = await Class.updateOne({ status: 1, userId: userId,classId:params.id }, {
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
