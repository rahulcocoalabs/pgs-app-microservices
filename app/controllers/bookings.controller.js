var gateway = require('../components/gateway.component.js');
var moment = require('moment');
var config = require('../../config/app.config.js');

const Movie = require('../models/movie.model.js');
const Event = require('../models/event.model.js');
const TheatreShow = require('../models/theatreShow.model.js');
const utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');
var eventsConfig = config.events;
var moviesConfig = config.movies;
var actorsConfig = config.movieActors;
var directorsConfig = config.movieDirectors;
var adsConfig = config.ads;
/* ************ Functions  ************ */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


function getRelatedMovies(perPage, callback) {
  gateway.get('/bookings/movies', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(err, result);
  });
}

function getApisWithAuth(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  gateway.getWithAuth(url, reqObj, bearer, function (err, result) {
    if (err) {
      console.log("Error fetching video categories...");
    }
    callback(err, result);
  });

};

  exports.getRunningMovies = (req, res) => {
    var currentTime = moment().unix();
    var filters = {
      status: 1,
      time: {
        $gt: currentTime
      }
    };
    var queryProjection = {
      name: 1,
      movieId: 1,
      movie: 1,
      time: 1
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

    TheatreShow.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate('movie').then(items => {


      Movie.countDocuments(filters, function (err, itemsCount) {
        var totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var k = 0;
        var runningMovies = [];
        while (k < items.length) {
          runningMovies.push({
            id: items[k].movie.id,
            image: items[k].movie.image,
            name: items[k].movie.name,
            yearOfRelease: items[k].movie.yearOfRelease || '2222',
            averageRating: items[k].movie.averageRating,
            maxRating: items[k].movie.maxRating
          });
          k++;
        }
        var responseObj = {
          imageBase: moviesConfig.imageBase,
          items: runningMovies,
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: runningMovies.length,
          totalPages: totalPages
        }
        res.send(responseObj);
      });

    });
  }
  exports.getSummary = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let runningMoviesReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_RUNNING_MOVIES
    };
    getApisWithAuth(runningMoviesReqObj, function (err, moviesResult) {
      var movies = {
        items: []
      };
      if (!err) {
        movies = JSON.parse(moviesResult);
      }
      let eventsReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_EVENTS
      };
      getApisWithAuth(eventsReqObj, function (err, eventsResult) {
        var events = {
          items: []
        };
        if (!err)
          events = JSON.parse(eventsResult);
        let adsReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_ADS_LIST
        };
        getApisWithAuth(adsReqObj, function (err, adsResult) {
          ads = {
            items: []
          };
          if (!err)
            ads = JSON.parse(adsResult);

          var bookingsSummary = {
            eventsImageBase: eventsConfig.imageBase,
            moviesImageBase: moviesConfig.imageBase,
            adsImageBase: adsConfig.imageBase,
            items: []
          };


          var items = [];
          items.push({
            type: "movies",
            title: "Top Movies",
            items: movies.items
          });

          items.push({
            type: "movies",
            title: "Trending Movies",
            items: movies.items
          });

          items.push({
            type: "events",
            title: "Trending Events",
            items: events.items
          });
          items.push({
            type: "events",
            title: "Top Events",
            items: events.items
          });

          items.push({
            type: "ads",
            title: "Advertisemets",
            items: ads.items
          });
          items.push({
            type: "ads",
            title: "Advertisemets",
            items: ads.items
          });

          shuffleArray(items);
          bookingsSummary.items = items;
          res.send(bookingsSummary);

        });


      });
    });


  }


  exports.getSummaryForWeb = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization']
    let moviesReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_MOVIES
    };
    getApisWithAuth(moviesReqObj, function (err, moviesResult) {
      var movies = {
        items: []
      };
      if (!err) {
        movies = JSON.parse(moviesResult);
      }
      let eventsReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_EVENTS
      };
      getApisWithAuth(eventsReqObj, function (err, eventsResult) {
        var events = {
          items: []
        };
        if (!err)
          events = JSON.parse(eventsResult);
        let adsReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_ADS_LIST
        };
        getApisWithAuth(adsReqObj, function (err, adsResult) {
          ads = {
            items: []
          };
          if (!err)
            ads = JSON.parse(adsResult);

          var bookingsSummary = {
            eventsImageBase: eventsConfig.imageBase,
            moviesImageBase: moviesConfig.imageBase,
            adsImageBase: adsConfig.imageBase,
            items: []
          };
          var len = events.items.length;
          var i = 0;
          var types = [];
          var typesLen = 0;
          var typeFoundFlag = 0;

          var items = [];
          while (i < len) {
            typeFoundFlag = 0;
            j = 0;
            while (j < typesLen) {
              if (events.items[i].category.id == types[j].typeId) {
                items[j].items.push(events.items[i]);
                typeFoundFlag++;
              }
              j++;
            }
            if (!typeFoundFlag) {
              types.push({
                typeId: events.items[i].category != null ? events.items[i].category.id : null,
                type: events.items[i].category != null ? events.items[i].category.name : null,
                arrayIndex: typesLen
              });
              items.push({
                type: "event",
                title: events.items[i].category != null ? events.items[i].category.name : null,
                items: []
              });
              items[typesLen].items.push(events.items[i]);
              typesLen++;
            }
            i++;
          }

          console.log(types);
          console.log(items);
          var items1 = [];
          items1.push({
            type: "events",
            title: "Events",
            totalItems: items.length,
            imageBase: eventsConfig.imageBase,
            items: items

          })
          items1.push({
            type: "movie",
            title: "Top Movies",
            totalItems: movies.totalItems,
            imageBase: movies.imageBase,
            items: movies.items
          });
          items1.push({
            type: "movie",
            title: "Trending Movies",
            totalItems: movies.totalItems,
            imageBase: movies.imageBase,
            items: movies.items
          });
          items1.push({
            type: "advertisement",
            title: "Advertisements",
            imageBase: ads.imageBase,
            items: ads.items,
            totalItems: ads.totalItems
          });

          var summary = {
            items: items1
          }
          res.send(summary);

        });


      });
    });


  }
  exports.getMoviesList = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1,
      maxRating: 1,
      averageRating: 1
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
  exports.getMovieDetail = (req, res) => {
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
  }
  exports.getActorsList = (req, res) => {
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
  exports.getActorsDetail = (req, res) => {
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
  exports.getMovieCategories = (req, res) => {
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
  exports.getMovieIndustries = (req, res) => {
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
  //get theaters by movie and date and show (optional)
  exports.getTheaters = (req, res) => {

  }
  //get seat availability for a particular show
  exports.getSeatAvailablility = (req, res) => {

  }
  exports.bookMovie = (req, res) => {

  }
  exports.getEventsList = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      title: 1,
      image: 1,
      venue: 1,
      eventDate: 1,
      eventCategoryId: 1,
      category: 1
    };


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || eventsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : eventsConfig.resultsPerPage;
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

    Event.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate(['category']).then(eventsList => {
      Event.countDocuments(filters, function (err, itemsCount) {

        /* var len = eventsList.length;
         var i =0;
         while(i<len) {
             delete eventsList[i].category;
             i++;
         } */
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: eventsConfig.imageBase,
          items: eventsList,
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
  exports.bookEvent = (req, res) => {

  }

