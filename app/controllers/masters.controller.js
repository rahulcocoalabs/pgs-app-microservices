const School = require('../models/school.model.js');
const Nationality = require('../models/nationality.model.js');
const Profession = require('../models/profession.model.js');
const Gender = require('../models/gender.model.js');
const Language = require('../models/language.model.js');
const Syllabus = require('../models/syllabus.model.js');
const tutorSyllabus = require('../models/tutorSyllabus.model.js');
const Hobby = require('../models/hobby.model.js');
const Keyword = require('../models/keyword.model.js');
const Filter = require('../models/filter.model.js');

const TutorCategory = require('../models/tutorCategory.model');
const TutorCourse = require('../models/tutorCourse.model');
const TutorClass = require('../models/tutorClass.model');
const TutorSubject = require('../models/tutorSubject.model');
const TutorRequest = require('../models/tutorRequest.model');
const User = require('../models/user.model');
const Currency = require('../models/currency.model');

//mongoose.Promise = global.Promise;

//Models for filters 

const Book = require('../models/book.model.js');


var gateway = require('../components/gateway.component.js');
var config = require('../../config/app.config.js');
var utilities = require('../components/utilities.component.js');
genderConfig = config.genders;
languageConfig = config.languages;
nationalityConfig = config.nationalities;
professionConfig = config.professions;
schoolConfig = config.genders;
syllabusConfig = config.genders;
hobbyConfig = config.hobbies;

async function populateFilterValues(title, entity, field, type) {
  //console.log("Inside populateFilterValues Function call. Following values are received ");
  //console.log("Entity : " + entity);
  //console.log("Field : " + field);
  //console.log("Type : " + type);
  var model;
  if (entity == "book") {
    model = Book;
  }

  if (type == "options") {
    var queryFilters = {
      status: 1
    };
    var queryProjection = String(field);
    //var valuesRes = await model.find(queryFilters, queryProjection).populate(queryProjection);
    //console.log("Options populated ads await method. The values are logged  below : ");
    //console.log(valuesRes);

    var i = 0;
    var j = 0;
    var authorCount;
    var tempAuthors;
    var uniqueAuthors = [];
    var tempFilter = {};
    var ret;
    //model.find({status: 1}, field).populate(field).distinct(field, function(error, valuesRes) {
    ret = await model.find(queryFilters, queryProjection).distinct(queryProjection).then(async function (valuesRes) {
      tempFilter[String(queryProjection)] = {
        $in: valuesRes
      };
      ret = await model.find(tempFilter, queryProjection).populate(queryProjection, 'name title').then(valuesRes => {
        while (i < valuesRes.length) {

          j = 0;
          //console.log("id is : " + valuesRes[i].id);
          tempAuthors = valuesRes[i][String(field)];

          if (Array.isArray(tempAuthors)) {
            authorCount = tempAuthors.length;
            while (j < authorCount) {
              if (!(uniqueAuthors.indexOf(tempAuthors[j]) > -1)) {
                uniqueAuthors.push(tempAuthors[j]);
              }
              j++;
            }
          } else {
            if (!(uniqueAuthors.indexOf(tempAuthors) > -1)) {
              uniqueAuthors.push(tempAuthors);
            }
          }

          i++;
        }
        return {
          title: title,
          fieldName: field,
          type: type,
          values: uniqueAuthors
        };
      });
      //console.log("@@@@ Ret 2 is " + JSON.stringify(ret));
      return ret;
    });
    //console.log("@@@@ Final Ret 1 is " + JSON.stringify(ret));
    return ret;
  }
  if (type == "range") {
    var queryFilters = {
      status: 1
    };
    var queryProjection = String(field);
    ret = await model.findOne(queryFilters, queryProjection).sort('-' + queryProjection).then(async function (maxValue) {
      //if err
      ret = await model.findOne(queryFilters).sort(queryProjection).then(function (minValue) {
        //if err
        return {
          title: title,
          fieldName: field,
          type: type,
          minValue: minValue[queryProjection],
          maxValue: maxValue[queryProjection]
        };
      });
      return ret;
    });
    return ret;
  }
}

function getGenders(callback) {
  gateway.get('/masters/genders', {}, function (err, result) {
    if (err) {
      console.log("Error fetching genders...");
    }
    callback(err, result);

  });
}

function getLanguages(callback) {
  gateway.get('/masters/languages', {}, function (err, result) {
    if (err) {
      console.log("Error fetching languages...");
    }
    callback(err, result);

  });
}

function getNationalities(callback) {
  gateway.get('/masters/nationalities', {}, function (err, result) {
    if (err) {
      console.log("Error fetching languages...");
    }
    callback(err, result);

  });
}

function getProfessions(callback) {
  gateway.get('/masters/professions', {}, function (err, result) {
    if (err) {
      console.log("Error fetching professions...");
    }
    callback(err, result);

  });
}

function getSchools(callback) {
  gateway.get('/masters/schools', {}, function (err, result) {
    if (err) {
      console.log("Error fetching schools...");
    }
    callback(err, result);

  });
}

function getHobbies(callback) {
  gateway.get('/masters/hobbies', {}, function (err, result) {
    if (err) {
      console.log("Error fetching hobbies...");
    }
    callback(err, result);

  });
}

function getSyllabuses(callback) {
  gateway.get('/masters/syllabuses', {}, function (err, result) {
    if (err) {
      console.log("Error fetching syllabuses...");
    }
    callback(err, result);

  });
}
/* ******* Get List functions ******** */
function getTopBooks(perPage, callback) {
  gateway.get('/books', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log("Error fetching popular books...");
    }
    callback(err, result);

  });
}

function getTopVideos(perPage, callback) {
  gateway.get('/videos', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log("Error fetching popular videos...");
    }
    callback(err, result);

  });
}

function getTopGames(perPage, callback) {
  gateway.get('/games', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log("Error fetching popular games...");
    }
    callback(err, result);

  });
}

function getTopTests(perPage, callback) {
  gateway.get('/tests', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log("Error fetching tests...");
    }
    callback(err, result);
  });
}

function getTopProducts(perPage, callback) {
  gateway.get('/store/products', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log("Error fetching popular books...");
    }
    callback(err, result);

  });
}

function getTopCharities(perPage, callback) {
  gateway.get('/charities', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(err, result);
  });
}

function getTopEvents(perPage, callback) {
  gateway.get('/events', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(err, result);
  });
}

function getTopMovies(perPage, callback) {
  gateway.get('/movies', {
    page: 1,
    perPage: perPage
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(err, result);
  });
}
/* ******** End ********* */

// get syllubus for tutors by rakesh

exports.getSyllubusTutor = async (req, res) => {

  var data = await tutorSyllabus.find({ status: 1 }).catch(error => {
    return { success: 0, message: error.message };
  })
  if (data && data.success && data.success === 0) {
    return res.send(data)
  }
  return res.send({ message: "listing syllubus", success: 1, items: data })
}
exports.getGenders = (req, res) => {
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
  var perPage = params.perPage || genderConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: Gender,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getHobbies = (req, res) => {
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
  var perPage = params.perPage || hobbyConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: Hobby,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getSchools = (req, res) => {
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
  var perPage = params.perPage || schoolConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: School,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getSyllabuses = (req, res) => {
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
  var perPage = params.perPage || syllabusConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: Syllabus,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getProfessions = (req, res) => {
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
  var perPage = params.perPage || professionConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: Profession,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getNationalities = (req, res) => {
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
  var perPage = params.perPage || nationalityConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: Nationality,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getLanguages = (req, res) => {
  var params = req.query;
  var filters = {
    status: 1
  };
  var queryProjection = {
    name: 1,
    flagImage: 1
  };
  var sortOptions = {};
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = params.perPage || languageConfig.resultsPerPage;
  var settings = {
    filters: filters,
    page: page,
    perPage: perPage,
    pagination: false,
    queryProjection: queryProjection,
    model: Language,
    returnPageData: false
  };
  utilities.getList(settings, function (result) {
    if (result)
      languagesList = {
        imageBase: languageConfig.imageBase || "",
        items: result.items || []
      }
    res.send(languagesList);
  });
}

exports.getRegisterMasters = (req, res) => {
  getGenders(function (err, gendersResult) {
    var genders = {
      items: []
    };
    if (!err) {
      genders = gendersResult;
    }
    getHobbies(function (err, hobbiesResult) {
      var hobbies = {
        items: []
      };
      if (!err) {
        hobbies = hobbiesResult;
      }
      getNationalities(function (err, nationalitiesResult) {
        var nationalities = {
          items: []
        };
        if (!err) {
          nationalities = nationalitiesResult;
        }

        getProfessions(function (err, professionsResult) {
          var professions = {
            items: []
          };
          if (!err) {
            professions = professionsResult;
          }

          getSchools(function (err, schoolsResult) {
            var schools = {
              items: []
            };
            if (!err) {
              schools = schoolsResult;
            }
            getSyllabuses(function (err, syllabusResult) {
              var syllabus = {
                items: []
              };
              if (!err) {
                syllabus = syllabusResult;
              }
              var registerMasters = {
                genders: genders,
                hobbies: hobbies,
                nationalities: nationalities,
                professions: professions,
                schools: schools,
                syllabuses: syllabus
              }
              res.send(registerMasters);

            });
          });
        });
      });
    });
  });
}

exports.searchKeywords = async(req, res) => {
  var params = req.query;
  console.log(params.keyword);
  var keyword = params.keyword;
  var regexp = new RegExp(keyword);
 // var filters = { value: { '$regex': regexp, '$options': 'i' }, status: 1 };
  var filters = {
    value: {
      $regex: regexp,
      $options: 'i'
    },status:1
  
  };
  var queryProjection = {
    value: 1,
    itemId: 1,
    itemType: 1
  };

  var result = await Keyword.find(filters, queryProjection).catch(err => {return {success:0, message:err.message}});

  if (result && result.sucess !== undefined && result.success ==0){
    return res.send(result);
  }

  return res.send({
      success:1,
      message:"search results listed",
      items:result
    })

}

exports.searchKeywords1 = (req, res) => {
  var params = req.query;
  console.log(params.keyword);
  var keyword = params.keyword;
  var regexp = new RegExp(keyword);
 // var filters = { value: { '$regex': regexp, '$options': 'i' }, status: 1 };
  var filters = {
    value: {
      '$regex': regexp,
      $options: 'i'
    },
    status: 1
  };
  var queryProjection = {
    value: 1,
    itemId: 1,
    itemType: 1
  };
  var sortOptions = {};
  /*var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = params.perPage || nationalityConfig.resultsPerPage; */
  var settings = {
    filters: filters,
    page: 1,
    perPage: 10,
    pagination: false,
    queryProjection: queryProjection,
    model: Keyword,
    returnPageData: false
  };
  console.log(filters)
  utilities.getList(settings, function (result) {
    if (result)
      res.send(result);
  });
}
exports.getFilters = (req, res) => {
  var errors = [];
  var params = req.query;
  if (!params.entity) {
    errors.push({
      field: "entity",
      message: "entity cannot be empty"
    });
  }
  if (errors.length) {
    res.send({
      success: 0,
      status: 500,
      errors: errors
    });
    return;
  }

  Filter.find({
    entity: params.entity,
    status: 1
  }, {
    entity: 1,
    title: 1,
    fieldName: 1,
    filterType: 1
  }).then(async availableFilters => {
    //console.log("Available filters are ");
    //console.log(availableFilters);
    if (availableFilters.length && availableFilters.length > 0) {
      var filtersResponse = [];
      var length = availableFilters.length;
      //console.log("Available filters count is " + length);
      var i = 0;
      var filters = [];
      var filter = null;
      while (i < availableFilters.length) {
        //console.log("Running loop " + i);
        //console.log("About to call available filters with following params");

        //console.log("     Entity : " + availableFilters[i].entity);
        //console.log("     Field Name : " + availableFilters[i].fieldName);
        //console.log("     Filter Type : " + availableFilters[i].filterType);
        filter = await populateFilterValues(availableFilters[i].title, availableFilters[i].entity, availableFilters[i].fieldName, availableFilters[i].filterType);

        filter ? filters.push(filter) : '';
        i++;
      }
      //console.log("filtersResponse is ");
      //console.log(filtersResponse);

      // Change  this
      var sorts = [];
      sorts.push({
        title: "Latest",
        fieldName: "time",
        value: "desc"
      });
      sorts.push({
        title: "Oldest",
        fieldName: "time",
        value: "asc"
      });
      sorts.push({
        title: "Popular",
        fieldName: "popularity",
        value: "desc"
      });
      sorts.push({
        title: "Less Popular",
        fieldName: "popularity",
        value: "asc"
      });

      //Change sorts


      var responseObj = {
        entity: params.entity,
        filters: filters,
        sorts: sorts
      }
      res.send(responseObj);
    } else {
      res.send({
        entity: params.entity,
        filters: [],
        sorts: sorts
      });
    }
  });

}
exports.defaultSearch = (req, res) => {
  getTopBooks(5, function (err, booksResult) {
    var books = {
      items: []
    };
    if (!err) {
      books = {
        imageBase: config.books.imageBase,
        items: booksResult.items
      }
    }
    getTopVideos(5, function (err, videosResult) {
      videos = {
        items: []
      }
      if (!err) {
        videos = {
          imageBase: config.videos.imageBase,
          items: videosResult.items
        }
      }
      getTopGames(5, function (err, gamesResult) {
        var games = {
          items: []
        };
        if (!err) {
          games = {
            imageBase: config.games.imageBase,
            items: gamesResult.items
          }
        }
        getTopTests(5, function (err, testsResult) {
          tests = {
            items: []
          }
          if (!err) {
            tests = {
              imageBase: config.tests.imageBase,
              items: testsResult.items
            }
          }
          getTopProducts(5, function (err, productsResult) {
            var products = {
              items: []
            };
            if (!err) {
              products = {
                imageBase: config.stores.imageBase,
                items: productsResult.items
              }
            }
            getTopCharities(5, function (err, charitiesResult) {
              charities = {
                items: []
              }
              if (!err) {
                charities = {
                  imageBase: config.charities.imageBase,
                  items: charitiesResult.items
                }
              }
              getTopMovies(5, function (err, moviesResult) {
                var movies = {
                  items: []
                };
                if (!err) {
                  movies = {
                    imageBase: config.movies.imageBase,
                    items: moviesResult.items
                  }
                }
                getTopEvents(5, function (err, eventsResult) {
                  events = {
                    items: []
                  }
                  if (!err) {
                    events = {
                      imageBase: config.events.imageBase,
                      items: eventsResult.items
                    }
                  }

                  var defaultResult = {
                    books: books,
                    videos: videos,
                    games: games,
                    tests: tests,
                    products: products,
                    charities: charities,
                    movies: movies,
                    events: events
                  };
                  res.send(defaultResult);

                });
              });
            });
          });
        });
      });
    });
  });
}

exports.getCources = async (req, res) => {
  var courcesData = await TutorCourse.find({
    status: 1
  }, { name: 1 })
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting courses',
        error: err
      }
    })
  if (courcesData && (courcesData.success !== undefined) && (courcesData.success === 0)) {
    return courcesData;
  }

  return res.send({
    success: 1,
    statusCode: 200,
    items: courcesData,
    message: 'Courses list'
  })
}

exports.getCategories = async (req, res) => {
  var categoriesData = await TutorCategory.find({
    status: 1
  }, { name: 1 })
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting categories',
        error: err
      }
    })
  if (categoriesData && (categoriesData.success !== undefined) && (categoriesData.success === 0)) {
    return categoriesData;
  }

  return res.send({
    success: 1,
    statusCode: 200,
    items: categoriesData,
    message: 'Categories list'
  })
}
exports.getSubjects = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
 
  var checkResult = await checkSubjectsForOnlineClass(params, userId);
  console.log("flag 0 ->",checkResult );
  if (checkResult && (checkResult.success !== undefined) && (checkResult.success === 0)) {
    return res.send(checkResult);
  }
  
  if (checkResult.isAllSubjects || (!checkResult.isAllSubjects && checkResult.subjectIds.length > 0)) {
    var findCriteria = {};
    if (!checkResult.isAllSubjects) {
      findCriteria = {
        _id: {
          $in: checkResult.subjectIds
        }
      };
    }
    findCriteria.status = 1
    var subjectsData = await TutorSubject.find(findCriteria, { name: 1 })
      .sort({
        'tsCreatedAt': -1
      })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting subjects',
          error: err
        }
      })
    if (subjectsData && (subjectsData.success !== undefined) && (subjectsData.success === 0)) {
      return subjectsData;
    }

    return res.send({
      success: 1,
      statusCode: 200,
      items: subjectsData,
      message: 'Subjects list'
    })
  } else {
    return res.send({
      success: 1,
      statusCode: 200,
      items: [],
      message: 'No subjects'
    })
  }
}

exports.getClasses = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var checkResult = await checkClassesForOnlineClass(params, userId)
  if (checkResult && (checkResult.success !== undefined) && (checkResult.success === 0)) {
    return res.send(checkResult);
  }

  if (checkResult.isAllClasses || (!checkResult.isAllClasses && checkResult.classIds.length > 0)) {
    var findCriteria = {};
    if (!checkResult.isAllClasses) {
      findCriteria = {
        _id: {
          $in: checkResult.classIds
        }
      };
    }
    findCriteria.status = 1

    var classesData = await TutorClass.find(findCriteria, { name: 1 })
      .sort({
        'sortOrder': 1
      })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting classes',
          error: err
        }
      })
    if (classesData && (classesData.success !== undefined) && (classesData.success === 0)) {
      return classesData;
    }

    return res.send({
      success: 1,
      statusCode: 200,
      items: classesData,
      message: 'Classes list'
    })
  } else {
    return res.send({
      success: 1,
      statusCode: 200,
      items: [],
      message: 'No classes'
    })
  }
}

exports.listCurrencies = async (req, res) => {
  var currencyData = await Currency.find({
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while listing currencies',
        error: err
      }
    })
  if (currencyData && (currencyData.success !== undefined) && (currencyData.success === 0)) {
    return res.send(currencyData);
  }
  return res.send({
    success: 1,
    statusCode: 200,
    items: currencyData,
    message: 'listing currencies',
  })
}




async function checkSubjectsForOnlineClass(params, userId) {
  if ((params.isMySubjects && params.isMySubjects === '1') || (params.tutorId)) {
    if (params.tutorId) {
      userId = params.tutorId;
    }
    var userData = await User.findOne({
      _id: userId,
      isTutor: true,
      status: 1
    }, {
      tutorSubjectIds: 1,
      isTutor: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting user subject ids',
          error: err
        }
      })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
      return userData;
    }
    if (userData) {
      if (userData.isTutor !== undefined && userData.isTutor) {

        return {
          success: 1,
          isAllSubjects: false,
          subjectIds: userData.tutorSubjectIds
        }
      } else {
        return {
          success: 0,
          message: 'User not a tutor',
        }
      }
    } else {
      return {
        success: 0,
        message: 'User not exists',
      }
    }

  } else {
    return {
      success: 1,
      isAllSubjects: true
    }
  }
}

async function checkClassesForOnlineClass(params, userId) {
  console.log("userId : " + userId)
  if ((params.isMyClasses && params.isMyClasses === '1') || params.tutorId) {
    if (params.tutorId) {
      userId = params.tutorId;
    }
    var userData = await User.findOne({
      _id: userId,
      status: 1
    }, {
      tutorClassIds: 1,
      isTutor: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting user class ids',
          error: err
        }
      })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
      return userData;
    }
    if (userData) {
      if (userData.isTutor !== undefined && userData.isTutor) {
        return {
          success: 1,
          isAllClasses: false,
          classIds: userData.tutorClassIds
        }
      } else {
        return {
          success: 0,
          message: 'User not a tutor',
        }
      }
    } else {
      return {
        success: 0,
        message: 'User not exists',
      }
    }
  } else {
    return {
      success: 1,
      isAllClasses: true
    }
  }
}