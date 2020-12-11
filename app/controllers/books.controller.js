var gateway = require('../components/gateway.component.js');
var moment = require('moment');
const Book = require('../models/book.model.js');
const Reviews = require('../models/review.model.js');
const Author = require('../models/bookAuthor.model.js');
const Category = require('../models/bookCategory.model.js');
const Publisher = require('../models/bookPublisher.model.js');
const Favourite = require('../models/favourite.model.js');
const constants = require('../helpers/constants');

var config = require('../../config/app.config.js');
var booksConfig = config.books;
var authorsConfig = config.authors;
var bookCategoriesConfig = config.bookCategories;
var publishersConfig = config.publishers;
/* ************ Functions  ************ */

//rakesh view count 

exports.didClickDownloadButton = async (req, res) => {

  if (!req.params){
    return res.status(500).json({ message: "add params in request", success:0})
  }
  if (!req.params.id){
    return res.status(500).json({ message: "add id in params  in request", success:0})
  }

  try {
    var response = await Book.updateOne({ status: 1, _id: req.params.id }, { $inc: { viewCount: 1 } });

    if (response){
      return res.status(200).json({
        success: 1,
        message:"count increased successfully"
      })
    }

  }
  catch (error) {

      return res.status(500).json({ message: error.message, success:0})
  }

}


function getAvailableFilters(entity, callback) {
  gateway.get('/masters/filters', {
    entity: entity
  }, function (err, result) {
    if (err) {
      console.log("Error fetching filters for book");
    }
    callback(err, result);
  })
}

function getApisWithAuth(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  gateway.getWithAuth(url, reqObj, bearer, function (err, result) {
    if (err) {
      console.log("Error fetching books ..." + url);

    }
    callback(err, result);
  });

};
/* ************ Books Section ************ */

// function booksController(methods, options) {

  exports.listAllBooks = (req, res, callback) => {
    var ObjectId = require('mongoose').Types.ObjectId;
    var filters = {
      status: 1
    };
    var queryProjection = {};
    var categoryId;
    var isTrending;
    var suggestedBooks;


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;

    var fields = ['name', 'description', 'authors', 'publisher', 'categories', 'pageCount', 'viewCount', 'averageRating', 'reviewCount', 'datePublished', 'image', 'minUserAge', 'maxUserAge', 'language', 'sharingUrl', 'tags'];
    if (params.fields) {
      fields = params.fields.trim().split(',');
    }
    if (params.categoryId) {
      categoryId = params.categoryId;
    }
    // if(params.isTrending) {
    //     isTrending = params.isTrending
    // }
    // if(params.suggestedBooks) {
    //     console.log(params.suggestedBooks);
    //     suggestedBooks = params.suggestedBooks
    // }
    // if(typeof suggestedBooks != undefined) {
    //     isTrending = params.suggestedBooks
    // }
    //console.log("fields = " + fields);
    var field = null;

    for (i = 0; i < fields.length; i++) {
      field = fields[i];
      queryProjection[field] = 1;
    }
    var perPage = Number(params.perPage) || booksConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : booksConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };

    var populate = [];
    if (queryProjection.authors == 1) {
      queryProjection.bookAuthorIds = 1;
      populate.push('authors');
    }
    if (queryProjection.publisher == 1) {
      queryProjection.publisherId = 1;
      populate.push('publisher');
    }
    if (queryProjection.categories == 1) {
      queryProjection.bookCategoryIds = 1;
      populate.push('categories');
    }
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
      if (params.sortBy == 'rating')
        sortOptions.averageRating = sortOrder ? sortOrder : -1;
    } else {
      sortOptions.tsCreatedAt = -1;
    }

    if (params.filters) {
      console.log("Received filters string" + params.filters);
      var reqFilters = JSON.parse(params.filters);
      getAvailableFilters('book', function (err, availableFilters) {
        //console.log(JSON.stringify(availableFilters.filters));

        var totalFilters = availableFilters.filters.length;
        //console.log("Total Filters length is " + totalFilters);
        var i = 0;
        var j;
        var k;
        while (i < totalFilters) {
          j = 0;
          filtersLen = reqFilters.length;
          console.log("User entered filters length is " + filtersLen);
          while (j < filtersLen) {
            if (reqFilters[j].name == availableFilters.filters[i].fieldName) {
              var reqValues = [];
              if (reqFilters[j].values && Array.isArray(reqFilters[j].values) && reqFilters[j].values.length) {
                k = 0;
                while (k < reqFilters[j].values.length) {
                  if (ObjectId.isValid(reqFilters[j].values[k]))
                    reqValues.push(reqFilters[j].values[k]);
                  k++;
                }
                filters[String(availableFilters.filters[i].fieldName)] = {
                  $in: reqValues
                };
                console.log("Filters Upadated" + JSON.stringify(filters));
              }
            }
            j++;
          }
          i++;
        }


        Book.find(filters, queryProjection, pageParams).populate(populate).sort(sortOptions).limit(perPage).then(booksList => {
          Book.countDocuments(filters, function (err, itemsCount) {
            var i = 0;
            var items = [];
            var tempDatePublished = "";
            const totalRating = booksConfig.totalRating;
            var itemsCountCurrentPage = booksList.length;
            for (i = 0; i < itemsCountCurrentPage; i++) {
              if (booksList[i].datePublished) {
                var datePublished = booksList[i].datePublished;
                var dd = datePublished.getDate();

                var mm = datePublished.getMonth() + 1;
                var yyyy = datePublished.getFullYear();
                if (dd < 10) {
                  dd = '0' + dd;
                }

                if (mm < 10) {
                  mm = '0' + mm;
                }
                tempDatePublished = dd + '-' + mm + '-' + yyyy;
              }
            }
            totalPages = itemsCount / perPage;
            totalPages = Math.ceil(totalPages);
            var hasNextPage = page < totalPages;
            var responseObj = {
              imageBase: booksConfig.imageBase,
              items: booksList,
              page: page,
              perPage: perPage,
              hasNextPage: hasNextPage,
              totalItems: itemsCount,
              totalPages: totalPages
            }
            if (res) {
              console.log("Returning values now");
              res.send(responseObj);

            }
            if (callback) {
              callback(responseObj);
            }
          });

        });

      });

    }
    if (categoryId) {
      filters["bookCategoryIds"] = {
        $in: categoryId
      };
    }

    if (params.isTrending == "true") {
      filters["isTrending"] = true;
    } else if (params.isTrending == "false") {
      filters["isTrending"] = false;
    }

    Book.find(filters, queryProjection, pageParams).populate(populate).sort(sortOptions).limit(perPage).then(booksList => {
      Book.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];
        var tempDatePublished = "";
        const totalRating = booksConfig.totalRating;
        var itemsCountCurrentPage = booksList.length;
        for (i = 0; i < itemsCountCurrentPage; i++) {
          if (booksList[i].datePublished) {
            var datePublished = booksList[i].datePublished;
            var dd = datePublished.getDate();

            var mm = datePublished.getMonth() + 1;
            var yyyy = datePublished.getFullYear();
            if (dd < 10) {
              dd = '0' + dd;
            }

            if (mm < 10) {
              mm = '0' + mm;
            }
            tempDatePublished = dd + '-' + mm + '-' + yyyy;
          }
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: booksConfig.imageBase,
          items: booksList,
          page: page,
          perPage: perPage,
          hasNextPage: hasNextPage,
          totalItems: itemsCount,
          totalPages: totalPages
        }
        if (res) {

          res.send(responseObj);
          console.log("Returning values now");
        }
        if (callback) {
          callback(responseObj);
        }
      });

    });
    /*if (params.bookAuthorIds) {

        var ObjectId = require('mongoose').Types.ObjectId;
        bookAuthorIds = params.bookAuthorIds.split(',');
        var j = 0;
        var len = bookAuthorIds.length;
        sortedBookAuthorIds = [];
        while (j < len) {
            if (ObjectId.isValid(bookAuthorIds[j]))
                sortedBookAuthorIds.push(bookAuthorIds[j]);
            j++;
        }
        filters.bookAuthorIds = { $in: sortedBookAuthorIds };
    }
    if (params.bookPublisherIds) {
        filters.bookPublisherIds = { $in: params.bookPublisherIds };
    }
    if (params.bookCategoryIds) {
        filters.bookCategoryIds = { $in: params.bookCategoryIds };
    }
    if (params.minRating) {
        filters.averageRating = { $gt: Number(params.minRating) };
    }
    if (params.maxRating) {
        filters.averageRating = { $lt: Number(params.maxRating) };
    }
    if (params.userAge) {
        filters.minUserAge = { $lt: params.userAge };
        filters.maxUserAge = { $gt: params.userAge }
    }
    if (params.languageId) {
        filters.languageId = { $in: params.languageId };
    }
    */


    //console.log("Query Projection");;
    //console.log(queryProjection);
    //console.log("Populate");
    //console.log(populate);



  }

  exports.getBookDetail = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var id = req.params.id;
    let bearer = req.headers['authorization'];

    if (!id) {
      var responseObj = {
        success: 0,
        status: 400,
        errors: [{
          field: "id",
          message: "id is missing"
        }]
      };
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
      _id: 1,
      name: 1,
      description: 1,
      biography: 1,
      bookAuthorIds: 1,
      bookPublisherId: 1,
      pageCount: 1,
      viewCount: 1,
      averageRating: 1,
      reviewCount: 1,
      datePublished: 1,
      image: 1,
      minUserAge: 1,
      maxUserAge: 1,
      languageId: 1,
      language: 1,
      tags: 1,
      publisher: 1,
      authors: 1,
      sharingUrl: 1
    }
    // get data
    Book.findOne(filters, queryProjection).populate(['authors', 'publisher']).then(book => {
      Reviews.countDocuments({itemId: id}).then(reviewsCount => {
      if (!book) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Book not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      bookId = id;
      let topTrendingReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_BOOKS_LIST,
        isTrending: true
      };
      getApisWithAuth(topTrendingReqObj, function (err, trendingBooksRes) {
        var trendingBooks = {
          items: []
        };
        if (!err) {
          trendingBooks = JSON.parse(trendingBooksRes);
        }
        let reviewsReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_REVIEW_LIST,
          itemId: bookId
        };
        getApisWithAuth(reviewsReqObj, function (err, reviewsResonse) {
          var reviews = {
            items: []
          };
          let reviewsRes = {};
          if (!err) {
            reviewsRes = JSON.parse(reviewsResonse);

            reviews = {
              imageBase: reviewsRes.imageBase,
              userImageBase: reviewsRes.userImageBase,
              items: reviewsRes.items || []
            }
          }
          var favFilters = {
            status: 1,
            itemId: book.id,
            userId: userId
          };
          Favourite.countDocuments(favFilters).then(isFav => {
            isFav = isFav ? true : false;

            var datePublishedFormatted = moment(book.datePublished).format('YYYY');
            var authorsLen = book.authors.length;
            var i = 0;
            var authorItems = [];
            while (i < authorsLen) {
              authorItems.push({
                id: book.authors[i].id,
                name: book.authors[i].name,
                image: book.authors[i].image,
                activeFromYear: book.authors[i].activeFromYear,
                activeToYear: book.authors[i].activeToYear
              });
              i++;
            }
            authors = {
              imageBase: authorsConfig.imageBase,
              items: authorItems
            }
            var publisher = {
              imageBase: publishersConfig.imageBase,
              id: book.publisher.id,
              name: book.publisher.name,
              image: book.publisher.image
            }
            console.log(book);
            var bookDetail = {
              id: id || null,
              name: book.name || null,
              description: book.description || null,
              pageCount: book.pageCount || null,
              viewCount: book.viewCount || null,
              averageRating: book.averageRating || null,
              reviewCount: reviewsCount || null,
              datePublished: datePublishedFormatted || null,
              image: book.image || null,
              minUserAge: book.minUserAge || null,
              maxUserAge: book.maxUserAge || null,
              language: book.language || "English", //Fix this important
              tags: book.tags || null,
              sharingUrl: book.sharingUrl || null,
              isFav: isFav,
              imageBase: booksConfig.imageBase || null,
              authors: authors || [],
              publisher: publisher || [],
              reviews: reviews || [],
              trendingBooks: trendingBooks.items || []
            }

            console.log("Returning values now");
            res.send(bookDetail);
          });

        });
      });
    });
    });

  }
  //fix this for mobile
  exports.getSummary = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let popularReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_BOOKS_LIST,
      // isTrending: true
    };
    // { page: 1, perPage: perPage, isTrending:isTrending },
    getApisWithAuth(popularReqObj, function (err, booksResult) {
      var books = {
        items: []
      };
      if (!err) {
        books = JSON.parse(booksResult);
      }
      let suggestedBooksReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_BOOKS_LIST,
        // isTrending: false
      };

      getApisWithAuth(suggestedBooksReqObj, function (err, suggestedBookResult) {
        var suggestedbooks = {
          items: []
        };
        if (!err) {
          suggestedbooks = JSON.parse(suggestedBookResult);
        }

        var params = {
          perPage: 10
        };
        // var perPage = params.perPage ? params.perPage : 30;
        let authorsReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_BOOKS_AUTHORS_LIST,
        };
        getApisWithAuth(authorsReqObj, function (err, authorsResult) {
          var authors = {
            items: []
          };
          if (!err) {
            authors = JSON.parse(authorsResult);
          }
          let categoriesReqObj = {
            page: 1,
            perPage: 5,
            bearer,
            url: constants.API_BOOKS_CATEGORIES,
          };
          getApisWithAuth(categoriesReqObj, function (err, categoriesResult) {
            var categories = {
              items: []
            };
            if (!err) {
              categories = JSON.parse(categoriesResult);
            }
            let getAdsReqObj = {
              page: 1,
              perPage: 10,
              bearer,
              url: constants.API_ADS_LIST
            };
            getApisWithAuth(getAdsReqObj, function (err, adsResult) {
              var ads = {
                items: []
              };
              if (!err) {
                ads = JSON.parse(adsResult);
              }
              let getPublishersReqObj = {
                page: 1,
                perPage: 10,
                bearer,
                url: constants.API_BOOKS_PUBLISHERS
              };
              getApisWithAuth(getPublishersReqObj, function (err, publishersResult) {
                var publishers = {
                  items: []
                };
                if (!err)
                  publishers = JSON.parse(publishersResult);

                var categoriesSummary = {
                  imageBase: categories.imageBase,
                  totalItems: categories.totalItems,
                  items: categories.items
                }
                var authorsSummary = {
                  imageBase: authors.imageBase,
                  totalItems: authors.totalItems,
                  items: authors.items
                }
                var booksSummary = {
                  imageBase: books.imageBase,
                  totalItems: books.totalItems,
                  items: books.items
                }
                var suggestedBookSummary = {
                  imageBase: suggestedbooks.imageBase,
                  totalItems: suggestedbooks.totalItems,
                  items: suggestedbooks.items
                }
                var adsSummary = {
                  imageBase: ads.imageBase,
                  totalItems: ads.totalItems,
                  items: ads.items
                }
                var publishersSummary = {
                  imageBase: publishers.imageBase,
                  totalItems: publishers.totalItems,
                  items: publishers.items
                }
                summary.categories = categoriesSummary;
                summary.popularAuthors = authorsSummary;
                summary.popularBooks = booksSummary;
                summary.suggestedBooks = suggestedBookSummary;
                summary.trendingBooks = booksSummary;
                summary.publishers = publishersSummary;
                summary.ads = adsSummary;
                res.send(summary);

              });

            });
          });
        });
      });
    });


  }

  exports.getSummaryForWeb = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];

    let popularReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_BOOKS_LIST,
      isTrending: true
    };
    getApisWithAuth(popularReqObj, function (err, booksResult) {
      var books = {
        items: []
      };
      if (!err) {
        books = JSON.parse(booksResult);
      }
      var params = {
        perPage: 10
      };
      let authorsReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_BOOKS_AUTHORS_LIST,
      };
      getApisWithAuth(authorsReqObj, function (err, authorsResult) {
        var authors = {
          items: []
        };
        if (!err) {
          authors = JSON.parse(authorsResult);
        }
        let categoriesReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_BOOKS_CATEGORIES,
        };
        getApisWithAuth(categoriesReqObj, function (err, categoriesResult) {
          var categories = {
            items: []
          };
          if (!err) {
            categories = JSON.parse(categoriesResult);
          }
          let getAdsReqObj = {
            page: 1,
            perPage: 10,
            bearer,
            url: constants.API_ADS_LIST
          };
          getApisWithAuth(getAdsReqObj, function (err, adsResult) {
            var ads = {
              items: []
            };
            if (!err) {
              ads = JSON.stringify(adsResult);
            }
            let getPublishersReqObj = {
              page: 1,
              perPage: 10,
              bearer,
              url: constants.API_BOOKS_PUBLISHERS
            };
            getApisWithAuth(getPublishersReqObj, function (err, publishersResult) {
              var publishers = {
                items: []
              };
              if (!err)
                publishers = JSON.parse(publishersResult);

              var items = [];
              items.push({
                type: "category",
                title: "Categories",
                imageBase: categories.imageBase,
                items: categories.items,
                totalItems: categories.totalItems
              });
              items.push({
                type: "book",
                title: "Trending Books",
                imageBase: books.imageBase,
                items: books.items,
                totalItems: books.totalItems
              });
              items.push({
                type: "author",
                title: "Writers",
                imageBase: authors.imageBase,
                items: authors.items,
                totalItems: authors.totalItems
              });
              items.push({
                type: "advertisement",
                title: "Advertisements",
                imageBase: ads.imageBase,
                items: ads.items,
                totalItems: ads.totalItems
              });
              items.push({
                type: "book",
                title: "Popular Books",
                imageBase: books.imageBase,
                items: books.items,
                totalItems: books.totalItems
              });
              items.push({
                type: "publisher",
                title: "Top Publishers",
                imageBase: publishers.imageBase,
                items: publishers.items,
                totalItems: publishers.totalItems
              });
              items.push({
                type: "book",
                title: "Suggested Books",
                imageBase: books.imageBase,
                items: books.items,
                totalItems: books.totalItems
              });
              var summary = {
                items: items
              }
              res.send(summary);

            });

          });
        });
      });
    });


  }

  /* ************ Authors Section ************ */

  exports.listAllAuthors = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1
    };
    var sortOptions = {};

    var params = req.query;
    var page = Number(params.page) || 1;
    var page = Math.floor(page);
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || authorsConfig.resultsPerPage;
    var perPage = Math.floor(perPage);
    perPage = perPage > 0 ? perPage : authorsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };


    Author.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(authorsList => {
      Author.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];
        var itemsCountCurrentPage = authorsList.length;

        for (i = 0; i < itemsCountCurrentPage; i++) {
          items.push({
            id: authorsList[i]._id,
            name: authorsList[i].name || null,
            image: authorsList[i].image || null
          });
        }

        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: authorsConfig.imageBase,
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

  exports.getBookAuthorDetail = (req, res) => {
    let bearer = req.headers['authorization'];

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
      _id: 1,
      name: 1,
      image: 1,
      biography: 1,
      activeFromYear: 1,
      activeToYear: 1
    }
    // get data
    Author.findOne(filters, queryProjection).then(bookAuthor => {
      if (!bookAuthor) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Author not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      let booksReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_BOOKS_LIST,
        authorId: id
      };
      // page: 1, perPage: perPage, authorId: authorId }
      getApisWithAuth(booksReqObj, function (err, topBooksResultRes) {
        var topBooks = {
          items: []
        };
        let topBooksResult = JSON.parse(topBooksResultRes);
        if (!err) {
          topBooks = topBooksResult.items;
        }
        authorDetail = {
          imageBase: authorsConfig.imageBase,
          name: bookAuthor.name,
          image: bookAuthor.image,
          biography: bookAuthor.biography,
          activeFromYear: bookAuthor.activeFromYear,
          activeToYear: bookAuthor.activeToYear,
          topBooks: topBooks
        }
        res.send(authorDetail);
      });

    });

  }

  /* ************ Categories Section ************ */

  exports.listAllCategories = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1,
      gradientStartColorHex: 1,
      gradientEndColorHex: 1,
      gradientAngleDegrees: 1
    };
    var sortOptions = {};

    var params = req.query;
    var page = Number(params.page) || 1;
    var page = Math.floor(page);
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || bookCategoriesConfig.resultsPerPage;
    var perPage = Math.floor(perPage);
    perPage = perPage > 0 ? perPage : bookCategoriesConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };

    //if( req.body.keywords ||  ) {

    //}

    Category.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(categoriesList => {
      Category.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        items = [];
        var itemsCountCurrentPage = categoriesList.length;
        for (i = 0; i < itemsCountCurrentPage; i++) {

          items.push({
            id: categoriesList[i]._id,
            name: categoriesList[i].name || "",
            image: categoriesList[i].image || "",
            gradientStartColorHex: categoriesList[i].gradientStartColorHex || "",
            gradientEndColorHex: categoriesList[i].gradientEndColorHex || "",
            gradientAngleDegrees: categoriesList[i].gradientAngleDegrees || ""
          })
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: bookCategoriesConfig.imageBase,
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

  exports.getBookCategoryDetail = async (req, res) => {

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
      _id: 1,
      name: 1,
      description: 1,
      image: 1
    }
    // get data
    let bookCategory = await Category.findOne(filters, queryProjection).lean();
    if (!bookCategory) {
      var responseObj = {
        success: 0,
        status: 200,
        errors: [{
          field: "id",
          message: "Category not found with id"
        }]
      }
      res.send(responseObj);
      return;
    }

    bookCategory.imageBase = bookCategoriesConfig.imageBase;
    res.send(bookCategory);


  }

  /* ************ Publishers Section ************ */

  exports.listAllPublishers = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      name: 1,
      image: 1
    };
    var sortOptions = {};

    var params = req.query;
    var page = Number(params.page) || 1;
    var page = Math.floor(page);
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || publishersConfig.resultsPerPage;
    var perPage = Math.floor(perPage);
    perPage = perPage > 0 ? perPage : publishersConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };


    Publisher.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(publishersList => {
      Publisher.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];
        var itemsCountCurrentPage = publishersList.length;

        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        for (i = 0; i < itemsCountCurrentPage; i++) {
          items.push({
            id: publishersList[i]._id,
            name: publishersList[i].name,
            image: publishersList[i].image
          })
        }
        var responseObj = {
          imageBase: publishersConfig.imageBase,
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

  exports.getBookPublisherDetail = (req, res) => {
    console.log("Publisher details called");
    let bearer = req.headers['authorization'];

    var imageBase = publishersConfig.imageBase;
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
      _id: 1,
      name: 1,
      image: 1,
      description: 1
    }
    // get data
    Publisher.findOne(filters, queryProjection).then(bookPublisher => {
      if (!bookPublisher) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Publisher not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      bookPublisher = bookPublisher.toObject();
      delete bookPublisher._id;
      console.log("Listing books inside publisher detail....");
      bookPublisher.imageBase = imageBase;
      let booksReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_BOOKS_LIST,
        publisherId: bookPublisher.id
      };
      // var bReq = { query: { page: 1, perPage: 10, publisherId: bookPublisher.id } };
      getApisWithAuth(booksReqObj, function (err, booksResponseData) {
        var booksResponse = {
          items: []
        };
        if (!err) {
          booksResponse = JSON.parse(booksResponseData)
        }
        var ret = {};
        var params = {
          publisherId: bookPublisher.id
        };
        console.log("Finding authors inside publisher details...");
        let authorsReqObj = {
          // page: 1,
          // perPage : 10,
          bearer,
          publisherId: bookPublisher.id,
          url: constants.API_BOOKS_AUTHORS_LIST,
        };
        getApisWithAuth(authorsReqObj, function (err, authorsResponse) {
          console.log("Authors received.....");
          var authors = {
            items: []
          };
          if (!err) {
            authors = JSON.parse(authorsResponse);
          }
          ret = bookPublisher;
          ret.authors = authors;
          ret.books = booksResponse;
          console.log(ret);
          res.send(ret);
        });
      })
    });

  }

