const Movie = require('../models/movie.model.js');
const Actor = require('../models/movieActor.model.js');
const MovieIndustry = require('../models/movieIndustry.model.js');
const MovieCategory = require('../models/movieCategory.model.js');
const Favourite = require('../models/favourite.model.js');

var config = require('../../config/app.config.js');
var utilities = require('../components/utilities.component.js');
var moment = require('moment');

var moviesConfig = config.movies;
var movieIndustriesConfig = config.movieIndustries;
var movieCategoriesConfig = config.movieCategories;
var actorsConfig = config.movieActors;
var directorsConfig = config.movieDirectors;

function getRelatedMovies(movieId, callback) {
  utilities.get("/movies", {
    page: 1,
    perPage: 10
  }, function (err, result) {
    var items = [];
    if (result) {
      items = result.items;
    }
    callback.call(null, items);

  });

};


  exports.details = (req, res) => {

    utilities.validateIdInRequest(req, res, function (id) {
      var filters = {
        _id: id,
        status: 1
      };
      var queryProjection = {
        name: 1,
        image: 1,
        description: 1,
        dateOfRelease: 1,
        maxRating: 1,
        averageRating: 1,
        durationSeconds: 1,
        sharingUrl: 1,
        trailerYoutubeId: 1,
        images: 1,
        reviews: 1,
        actors: 1,
        movieActorIds: 1,
        categories: 1,
        movieCategoryIds: 1,
        movieDirectorIds: 1,
        directors: 1,
      };

      Movie.findOne(filters, queryProjection).populate([{
          path: 'actors',
          match: {
            status: 1
          }
        },
        {
          path: 'categories',
          match: {
            status: 1
          }
        }, ,
        {
          path: 'directors',
          match: {
            status: 1
          }
        }
      ]).then(item => { //ok
        if (!item) {
          var responseObj = {
            success: 0,
            status: 200,
            errors: [{
              field: "id",
              message: "Item not found with id"
            }]
          }
          res.send(responseObj);
          return;
        }
        item = item.toJSON();
        item.imageBase = moviesConfig.imageBase;
        item.actorImageBase = actorsConfig.imageBase;
        item.directorImageBase = directorsConfig.imageBase;
        utilities.getReviews(id, 1, 10, function (err, reviews) {
          reviews = reviews ? reviews : [];
          item.reviews = reviews;
          getRelatedMovies(id, function (movies) {
            item.relatedMovies = movies;
            res.send(item);
          });
        });
      });
    });
  };

  exports.getActorDetail = (req, res) => {

    var id = req.params.id;
    if (!id) {
      var responseObj = {
        success: 0,
        status: 400,
        errors: [{
          field: "id",
          message: "id is missing"
        }]
      }
      res.send(responseObj);
      return;
    }

    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(id);
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "id",
          message: "id is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }
    var filters = {
      _id: id,
      status: 1
    }
    var queryProjection = {
      name: 1,
      gender: 1,
      image: 1,
      dateOfBirth: 1,
      dateOfDeath: 1,
      placeOfBirth: 1,
      biography: 1,
      movieIds: 1,
      movies: 1,
      movieIndustryIds: 1,
      movieIndustries: 1,
      subImages: 1
    }
    // get data
    Actor.findOne(filters, queryProjection).populate(['movies', 'movieIndustries']).then(movieActor => {
      if (!movieActor) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Actor not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      var actorDetail = {
        imageBase: actorsConfig.imageBase,
        industryImageBase: movieIndustriesConfig.imageBase,
        movieImageBase: moviesConfig.imageBase,
        name: movieActor.name || null,
        gender: movieActor.gender || null,
        image: movieActor.image || null,
        dateOfBirth: moment(movieActor.dateOfBirth).format('DD MMMM YYYY') || null,
        dateOfDeath: moment(movieActor.dateOfDeath).format('DD MMMM YYYY') || null,
        placeOfBirth: movieActor.placeOfBirth || null,
        biography: movieActor.biography || null,
        movies: movieActor.movies || [],
        movieIndustries: movieActor.movieIndustries || [],
        subImages: movieActor.subImages || []

      }

      res.send(actorDetail);
    });

  }

  exports.all = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1,
      description: 1,
      dateOfRelease: 1,
      maxRating: 1,
      averageRating: 1,
      images: 1
    };


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || moviesConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : moviesConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };

    /* Sort */
    var sortOptions = {};
    if (params.sortBy) {
      sortOrder = null;
      if (params.sortOrder && params.sortOrder == 'asc')
        sortOrder = 1;
      if (params.sortOrder && params.sortOrder == 'desc')
        sortOrder = -1;
      if (params.sortBy == 'popularity')
        sortOptions.viewCount = sortOrder ? sortOrder : -1;
      if (params.sortBy == 'time')
        sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
    }

    Movie.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(items => {


      Movie.countDocuments(filters, function (err, itemsCount) {
        var totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: moviesConfig.imageBase,
          items: items,
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: itemsCount,
          totalPages: totalPages
        }
        res.send(responseObj);
      });

    });

  }
  exports.listActors = (req, res) => {
    var params = req.query;
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1,
      dateOfBirth: 1,
      dateOfDeath: 1
    };
    /* Sort */
    var sortOptions = {};
    if (params.sortBy) {
      sortOrder = null;
      if (params.sortOrder && params.sortOrder == 'asc')
        sortOrder = 1;
      if (params.sortOrder && params.sortOrder == 'desc')
        sortOrder = -1;
      if (params.sortBy == 'popularity')
        sortOptions.viewCount = sortOrder ? sortOrder : -1;
      if (params.sortBy == 'time')
        sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
    }

    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = params.perPage || actorsConfig.resultsPerPage;
    var settings = {
      filters: filters,
      page: page,
      perPage: perPage,
      pagination: false,
      queryProjection: queryProjection,
      model: Actor,
      returnPageData: true
    };
    utilities.getList(settings, function (result) {
      if (result)
        res.send(result);
    });
  }
  exports.listIndustries = (req, res) => {
    var params = req.query;
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1
    };
    /* Sort */
    var sortOptions = {};
    if (params.sortBy) {
      sortOrder = null;
      if (params.sortOrder && params.sortOrder == 'asc')
        sortOrder = 1;
      if (params.sortOrder && params.sortOrder == 'desc')
        sortOrder = -1;
      if (params.sortBy == 'popularity')
        sortOptions.viewCount = sortOrder ? sortOrder : -1;
      if (params.sortBy == 'time')
        sortOptions.tsCreatedAt = sortOrder ? sortOrder : -1;
    }

    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = params.perPage || movieCategoriesConfig.resultsPerPage;
    var settings = {
      filters: filters,
      page: page,
      perPage: perPage,
      pagination: false,
      queryProjection: queryProjection,
      model: MovieIndustry,
      returnPageData: true
    };
    utilities.getList(settings, function (result) {
      if (result)
        res.send(result);
    });
  }
  exports.listCategories = (req, res) => {
    var params = req.query;
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1
    };
    var sortOptions = {};
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = params.perPage || movieCategoriesConfig.resultsPerPage;
    var settings = {
      filters: filters,
      page: page,
      perPage: perPage,
      pagination: false,
      queryProjection: queryProjection,
      model: MovieCategory,
      returnPageData: true
    };
    utilities.getList(settings, function (result) {
      if (result)
        res.send(result);
    });
  }
