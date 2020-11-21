const mongoose = require('mongoose');
var moment = require('moment');
var utilities = require('../components/utilities.component.js');
const MovieActor = require('./movieActor.model.js');
const MovieDirector = require('./movieDirector.model.js');
const MovieCategory = require('./movieCategory.model.js');
function transform(record) { 
    var ret = record;
    ret.id = ret._id;
    delete ret._id; 
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
    ret.images = ret.images?ret.images:[];
    if(ret.actors) {
        delete ret.movieActorIds;
        var i = 0;
        var ln =  ret.actors.length;
        var actor = null;
        var tmp = null; 
        var nActors = []; 
        while(i<ln) {
            actor = ret.actors[i];
            tmp = { id:actor.id,name:actor.name, image:actor.image };
            nActors.push(tmp);
            i++;
        }  
        ret.actors = nActors;
    }
    if(ret.categories) {
        delete ret.movieCategoryIds;
        i = 0;
        ln =  ret.categories.length;
        nCategories = [];
        var category = null;
        while(i<ln) {
            tmp =  ret.categories[i];
            category = {id:tmp._id,name:tmp.name};
            nCategories.push(category);
            i++;
        }
        ret.categories =  nCategories;
    } 
    if(ret.directors) { 
        i = 0;
        ln =  ret.directors.length;
        var director = null;
        var directors =[];
        while(i<ln) {
            tmp =  ret.directors[i];
            director = {id:tmp._id,name:tmp.name,image:tmp.image};
            directors.push(director);
            i++;
        }
        delete ret.movieDirectorIds;  
        ret.directors = directors;
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

const MovieSchema = mongoose.Schema({
    name : String,
    description : String,
    image : String, 
    dateOfRelease : Date,
    durationSeconds : Number,
    movieDirectorIds : [{type: mongoose.Schema.Types.ObjectId, ref: 'MovieDirector'}],
    languageId :mongoose.Schema.Types.ObjectId,
    averageRating : Number, 
    maxRating : Number,
    movieActorIds : [{type: mongoose.Schema.Types.ObjectId, ref: 'MovieActor'} ],
    movieCategoryIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'MovieCategory' }],
    trailerYoutubeId:String,
    images: [String],
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
},options);


MovieSchema.virtual('sharingUrl').get(function () {
    return utilities.getSharingUrl("movies", this._id);
});

MovieSchema.virtual('actors', {
    ref: 'MovieActor',
    localField: 'movieActorIds',
    foreignField: '_id',
    justOne: false
});

MovieSchema.virtual('categories', {
    ref: 'MovieCategory',
    localField: 'movieCategoryIds',
    foreignField: '_id',
    justOne: false, 
});

MovieSchema.virtual('directors', {
    ref: 'MovieDirector',
    localField: 'movieDirectorIds',
    foreignField: '_id',
    justOne: false, 
});

module.exports = mongoose.model('Movie', MovieSchema, 'Movies');