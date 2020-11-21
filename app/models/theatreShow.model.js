const mongoose = require('mongoose');
const Theatre = require('./theatre.model.js');
const Movie = require('./movie.model.js');
var moment = require('moment');

function transform(ret) {
    console.log("Inside transform function of theatreshow");
    ret.id = ret._id;
    ret.time = moment.unix(ret.time).format("HH:MM:SS a DD MMMM YYYY");
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
    if(ret.movie) {
        console.log("Date of release is " + ret.dateOfRelease);
        ret.movie.yearOfRelease = moment(ret.movie.dateOfRelease).format('YYYY');
        console.log("Year of release is " + ret.yearOfRelease);
        delete ret.movieId;
        delete ret.movie._id;
        delete ret.movie.movieDirectorIds;
        delete ret.movie.movieActorIds;
        delete ret.movie.movieCategoryIds;
        delete ret.movie.status;
        delete ret.movie.tsCreatedAt;
        delete ret.movie.tsModifiedAt;
    }
    if(ret.theatre) {
        delete ret.theatreId;
        delete ret.theatre._id
        delete ret.theatre.status;
        delete ret.theatre.tsCreatedAt;
        delete ret.theatre.tsModifiedAt;
    }
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};

const TheatreShowSchema = mongoose.Schema({
    name : String,
    theatreId: {type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    time: Number,
    //costId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreSeatTypeCost' },
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);


TheatreShowSchema.virtual('movie', {
    ref: 'Movie',
    localField: 'movieId',
    foreignField: '_id',
    justOne: true
});
TheatreShowSchema.virtual('theatre', {
    ref: 'Theatre',
    localField: 'theatreId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('TheatreShow', TheatreShowSchema, 'TheatreShows');