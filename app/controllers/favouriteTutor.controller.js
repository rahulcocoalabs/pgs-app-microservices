const Favourite = require('../models/favouriteTutor.model.js');
const Class = require('../models/favouriteClass.model.js');
const onlineClass = require('../models/onlineClass.model.js');
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

    //validation 

    var existTutor = await User.countDocuments({ status: 1, _id: params.id });

    if (existTutor == 0) {
        return res.status(201).send({ success: 0, message: "No such tutor exist" })
    }

    var existCombo = await Favourite.countDocuments({ status: 1, tutorId: params.id, userId: userId });
    if (existCombo > 0) {
        return res.status(201).send({ success: 0, message: "already added to favourites" })
    }

    if (existTutor == 0) {
        return res.status(201).send({ success: 0, message: "No such tutor exist" })
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
        console.log(newFavourite);
        var info = await newFavourite.save();



        var update = await User.updateOne({ status: 1, _id: userId }, {
            $push: {
                favouriteTutor: params.id
            }

        })
        if (info && update) {
            return res.status(200).send({

                success: 1,
                message: "tutor added to your favourites"
            })
        }
    }
    catch (error) {
        return res.status(201).send({
            success: 1,
            message: error.message
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

        var existTutor = await User.countDocuments({ status: 1, _id: params.id });

        if (existTutor == 0) {
            return res.status(201).send({ success: 0, message: "No such tutor exist" })
        }

        var existCombo = await Favourite.countDocuments({ status: 1, tutorId: params.id, userId: userId });
        if (existCombo == 0) {
            return res.status(201).send({ success: 0, message: "not in favourite list" })
        }


        var update = await Favourite.updateOne({ status: 1, userId: userId, tutorId: params.id }, {
            status: 0
        })
        var update1 = await User.updateOne({status:1,_id:userId},{ $pull: {  favouriteTutor: params.id } })
        if (update && update1) {
            return res.status(200).send({
                success: 1,
                message: "removed from favourites"
            })
        }
        else {
            return res.status(201).send({
                success: 1,
                message: "no such entity exists"
            })
        }
    }
    catch (error) {
        return res.status(201).send({
            success: 1,
            message: error.message
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
            field: "classId",
            message: "classId  cannot be empty"
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

        var existTutor = await onlineClass.countDocuments({ status: 1, _id: params.id });

        if (existTutor == 0) {
            return res.status(201).send({ success: 0, message: "No such class exist" })
        }

        var existCombo1 = await Class.countDocuments({ status: 1, classId: params.id, userId: userId });
        console.log("combo",existCombo1,params.id,userId);
        if (existCombo1 > 0) {
            return res.status(201).send({ success: 0, message: "already added to favourites" })
        }
        
        const newClass = new Class({
            userId: userId,
            classId: params.id,
            classId:params.id,
            status: 1,
            tsCreatedAt: Number(moment().unix()),
            tsModifiedAt: null
        });
        console.log(newClass);
        var info = await newClass.save();



        var update = await User.updateOne({ status: 1, _id: userId }, {
            $push: {
                favouriteClass: params.id
            }

        })

        // })
        if (info && update) {
            return res.status(200).send({
                success: 1,
                message: "class added to your favourites"
            })
        }
    }
    catch (error) {
        return res.status(201).send({
            success: 1,
            message: error.message
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
            field: "classId",
            message: "classId  cannot be empty"
        });
    }

    if (errors.length) {
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }
    console.log(userId, params.id)
    try {
        var existClass = await onlineClass.countDocuments({ status: 1, _id: params.id });

        if (existClass == 0) {
            return res.status(201).send({ success: 0, message: "No such Class exist" })
        }

        var existCombo = await Class.countDocuments({ status: 1, classId: params.id, userId: userId });
        if (existCombo == 0) {
            return res.status(201).send({ success: 0, message: "not in favourite list" })
        }
        
        var update = await Class.updateOne({ status: 1, userId: userId, classId: params.id }, {
            status: 0
        })
        var update1 = await User.updateOne({status:1,_id:userId},{ $pull: {  favouriteClass: params.id } })
        if (update && update1) {
            return res.status(200).send({
                success: 1,
                message: "removed from favourites"
            })
        }
        else {
            return res.status(201).send({
                success: 1,
                message: "no such entity exists"
            })
        }
    }
    catch (error) {
        return res.status(201).send({
            success: 1,
            message: error.message
        })
    }

}
