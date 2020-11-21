const mongoose = require('mongoose');
const Movie = require('./movie.model.js');
const MovieIndustry = require('./movieIndustry.model.js');

function transform(ret) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.status;
  delete ret.tsCreatedAt;
  delete ret.tsModifiedAt;

  if (ret.movieIndustries) {
    delete ret.movieIndustryIds;
    var i = 0;
    while (i < ret.movieIndustries.length) {
      delete ret.movieIndustries[i].userIdCreator;
      delete ret.movieIndustries[i].status;
      delete ret.movieIndustries[i].tsCreatedAt;
      delete ret.movieIndustries[i].tsModifiedAt;
      i++;
    }
  }
  if (ret.movies) {
    delete ret.movieIds;
    var i = 0;
    while (i < ret.movies.length) {
      delete ret.movies[i].userIdCreator;
      delete ret.movies[i].status;
      delete ret.movies[i].tsCreatedAt;
      delete ret.movies[i].tsModifiedAt;
      i++;
    }
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
const MovieActorSchema = mongoose.Schema({
  name: String,
  genderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gender'
  },
  image: String,
  dateOfBirth: Date,
  dateOfDeath: Date,
  placeOfBirth: String,
  biography: String,
  movieIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  movieIndustryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MovieIndustry'
  }],
  subImages: [String],
  userIdCreator: String,
  status: Number,
  tsCreatedAt: Number,
  tsModifiedAt: Number
}, options);

MovieActorSchema.virtual('movies', {
  ref: 'Movie',
  localField: 'movieIds',
  foreignField: '_id',
  justOne: false
});
MovieActorSchema.virtual('movieIndustries', {
  ref: 'MovieIndustry',
  localField: 'movieIndustryIds',
  foreignField: '_id',
  justOne: false
});

module.exports = mongoose.model('MovieActor', MovieActorSchema, 'MovieActors');
