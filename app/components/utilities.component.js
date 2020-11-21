var ObjectId = require('mongoose').Types.ObjectId;
var gateway = require('../components/gateway.component.js');
const Favourite = require('../models/favourite.model.js');

var cors = require('cors');

module.exports = {
    enableCors: function (app) {
        app.use(cors());
    },
    getList: function (settings, callback) {
        /**
         * Settings => {
         *    filters:<>,
         *    page:<>,
         *    perPage:<>,
         *    pagination:true/false
         *    queryProjection:<>,
         *    model:<>,
         *    returnPageData:true/false
         * }
         */
        var pagination = settings.pagination !== undefined ? settings.pagination : true;
        var page = settings.page ? settings.page : 1;
        var perPage = settings.perPage ? settings.perPage : 30;
        perPage = Number(perPage);
        var model = settings.model;
        var filters = settings.filters ? settings.filters : {};
        var returnPageData = settings.returnPageData !== undefined ? settings.returnPageData : true;
        var queryProjection = settings.queryProjection ? settings.queryProjection : {};
        var sortOptions = settings.sortOptions ? settings.sortOptions : {};
        var callerObj = null;

        if (pagination) {
            var offset = (page - 1) * perPage;
            var pageParams = { skip: offset, limit: perPage };
            callerObj = model.find(filters, queryProjection, pageParams).limit(perPage);
        } else {
            callerObj = model.find(filters, queryProjection);
        }
        var items = [];
        callerObj.sort(sortOptions).then(list => {
            var ret = {
                items: list
            };
            if (returnPageData) {
                model.countDocuments(filters, function (err, itemsCount) {
                    var totalPages = itemsCount / perPage;
                    totalPages = Math.ceil(totalPages);
                    var hasNextPage = page < totalPages;
                    ret.totalPages = totalPages;
                    ret.perPage = perPage;
                    ret.page = page;
                    ret.hasNextPage = hasNextPage;
                    ret.hasNextPage = hasNextPage;
                    callback.call(null, ret);
                    return;
                });
            } else {
                callback.call(null, ret);
                return;
            }
        });
    },
    validateIdInRequest: function (req, res, callback) {
        var id = req.params.id;
        if (!id) {
            var responseObj = {
                success: 0,
                status: 400,
                errors: [{ field: "id", message: "id is missing" }]
            }
            res.send(responseObj);
            return;
        }

        var isValidId = ObjectId.isValid(id);
        if (!isValidId) {
            var responseObj = {
                success: 0,
                status: 401,
                errors: [{ field: "id", message: "id is invalid" }]
            }
            res.send(responseObj);
            return;
        }
        callback.call(null, id, req, res);
    },
    getSharingUrl: function (itemType, id) {
        return "http://www.pgsapp.com/" + itemType + "/" + id;
    },
    checkIsFav: async function (id) {
        console.log("Check isFav function called");
        var filters = {
            status: 1,
            itemId: id,
            userId: "5d9856833b775074971fcab5"
        };
        var isFav = await Favourite.countDocuments(filters);

        console.log("isFav is " + isFav);
        return isFav;
    },

    getReviews: function (itemId, page, perPage, callback) {
        gateway.get('/reviews', { page: page, perPage: perPage, itemId: itemId }, function (err, result) {
            if (err) {
                console.log("Error fetching reviews...");
            }
            callback(err, result);
        });
    },
    get: function (path, params, callback) {
        gateway.get(path, params, callback);
    },
    validateMandatoryFields: function (params, reqFields, res, sendResponse) {
        var ok = true;
        sendResponse = sendResponse !== undefined ? sendResponse : true;
        var i = 0;
        var ln = reqFields.length;;
        var missingFields = [];
        var field = null;
        while (i < ln) {
            field = reqFields[i];
            if (!params[field])
                missingFields.push(field);
            i++;
        }
        if (missingFields.length) {
            ok = false;
            var resp = {
                success: 0,
                message: "fields mising",
                fields: missingFields
            };
            if (sendResponse)
                res.send(resp);
        }
        var ret = new Promise((resolve, reject) => {
            resolve(missingFields);
        });
        return ret;
    },
    shuffleArray: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
      } 

};
