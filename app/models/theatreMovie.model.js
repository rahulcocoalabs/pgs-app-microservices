const mongoose = require('mongoose');

const TheatreMovieSchema = mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, 
    showDate: String,
    showEndTime: String,
    showStartTime: String,
    theatreId: {type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    theatreScreenId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreScreen' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('TheatreMovie',  TheatreMovieSchema, 'TheatreMovies');