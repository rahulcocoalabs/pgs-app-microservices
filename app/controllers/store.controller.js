var gateway = require('../components/gateway.component.js');
const StoreCategory = require('../models/storeCategory.model.js');
const StoreBanner = require('../models/storeBanner.model.js');
const StoreProduct = require('../models/storeProduct.model.js');
var utilities = require('../components/utilities.component.js');
const Favourite = require('../models/favourite.model.js');
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants');

var storeConfig = config.stores;
var storeCategoriesConfig = config.storeCategories;
var storeBannersConfig = config.storeBanners;
var storeProductsConfig = config.storeProducts;


function getApisWithAuth(reqObj,callback) {
    let bearer = reqObj.bearer;
    let url = reqObj.url;
    delete reqObj.bearer;
    delete reqObj.url;
    gateway.getWithAuth(url,reqObj, bearer, function (err, result) {
        if (err) {
            console.log("Error fetching..." + url);

        }
        callback(err, result);
    });
   
  };

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getBanners(params, callback) {
    var items = [];

    var filters = { status: 1 };
    var queryProjection = { title: 1, image: 1, mySqlBannerId: 1 };
    var sortOptions = { sortOrder: 1 };

    StoreBanner.find(filters, queryProjection).sort(sortOptions).then(bannersList => {
        console.log(bannersList);
        var i = 0;
        var items = bannersList;
        totalPages = 1;
        var hasNextPage = 0;
        var responseObj = {
            imageBase: storeBannersConfig.imageBase,
            items: items
        }
        callback.call(null, responseObj);
    });

}

function getCategories(params, callback) {
    //var parentCategoryId = params.parentCategoryId ? params.parentCategoryId : null;
    //if parent category id is there return categories in which  it is the parent
    var items = [];

    var filters = { status: 1 };
    var queryProjection = { _id: 1, name: 1, image: 1, sortOrder: 1 };
    var sortOptions = { sortOrder: 1 };

    var page = Number(params.page) || 1;
    var page = 1;
    var page = Math.floor(page);
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || storeCategoriesConfig.resultsPerPage;
    var perPage = Math.floor(perPage);
    perPage = perPage > 0 ? perPage : storeCategoriesConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = { skip: offset, limit: perPage };


    StoreCategory.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(categoriesList => {
        StoreCategory.countDocuments(filters, function (err, itemsCount) {
            var i = 0;
            var items = [];
            var len = categoriesList.length;
            console.log("Return Length is " + len);
            console.log("Total ItemsCount is " + itemsCount);
            while (i < len) {
                items.push({
                    id: categoriesList[i]._id,
                    name: categoriesList[i].name,
                    gradientStartColorHex: categoriesList[i].description,
                    image: categoriesList[i].image,
                    gradientEndColorHex: categoriesList[i].sortOrder
                })
                i++;
            }
            totalPages = itemsCount / perPage;
            totalPages = Math.ceil(totalPages);
            var hasNextPage = page < totalPages;
            var responseObj = {
                imageBase: storeCategoriesConfig.imageBase,
                items: items,
                page: page,
                perPage: perPage,
                hasNextPage: hasNextPage,
                totalItems: itemsCount,
                totalPages: totalPages
            }
            callback(responseObj);
        });
    });
}

function getProducts(params, callback) {
    var filters = { status: 1 };
    var queryProjection = {
        name: 1, averageRating: 1, maxRating: 1,
        originalPrice: 1, image: 1, finalPrice: 1, mysqlProductId: 1
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
    var perPage = params.perPage || storeProductsConfig.resultsPerPage;
    var settings = {
        filters: filters,
        page: page,
        perPage: perPage,
        pagination: true,
        queryProjection: queryProjection,
        model: StoreProduct,
        returnPageData: true
    };
    var imageBase = storeProductsConfig.imageBase;
    utilities.getList(settings, function (result) {
        result.imageBase = imageBase;
        if (callback)
            callback.call(null, result);
        return;
    });
}


exports.categories =  (req, res) => {
    getCategories(req.query, function (result) {
        res.send(result);
    });
};
exports.productDetails =  (req, res) => {
    var item = {};
    var userData = req.identity.data;
    var userId = userData.userId;
    let bearer = req.headers['authorization'];
    var item = {};
    var id = req.params.id;
    if (!id) {
        var responseObj = {
            success: 0,
            status: 400,
            errors: [{ field: "id", message: "id is missing" }]
        };
        res.send(responseObj);
        return;
    }

    var ObjectId = require('mongoose').Types.ObjectId;
    /*
    var isValidId = ObjectId.isValid(id);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: [{ field: "id", message: "id is invalid" }]
        }
        res.send(responseObj);
        return;
    } */
    var filters = {
        mysqlProductId: id,
        status: 1
    }
    var queryProjection = {
        name: 1,
        mysqlProductId: 1,
        shortDescription: 1,
        description: 1,
        originalPrice: 1,
        averageRating: 1,
        maxRating: 1,
        finalPrice: 1,
        image: 1,
        subImages: 1,
        attributes: 1,
        stockStatus: 1,
        specifications: 1,
        sharingUrl: 1,
        isFav: 1
    };
    console.log(id);

    // get data
    StoreProduct.findOne(filters, queryProjection).then(product => {
        if (!product) {
            var responseObj = {
                success: 0,
                status: 200,
                errors: [{ field: "id", message: "Product not found with id" }]
            }
            res.send(responseObj);
            return;
        }

        product = product.toObject();
        productId = id;
        originalId = product.originalId;
        let trendingProductsReqObj = {
            page: 1,
            perPage : 10,
            bearer,
            url : constants.API_PRODUCTS,
        };
        getApisWithAuth(trendingProductsReqObj, function (err, trendingProductsRes) {
            var trendingProductsResObj = JSON.parse(trendingProductsRes);
            var relatedProducts = { items: [] };
            if (!err) {
                relatedProducts = trendingProductsResObj.items;
            }
            console.log("Original Id " + originalId);
            let reviewReqObj = {
                page: 1,
                perPage : 10,
                itemId: originalId,
                bearer,
                url : constants.API_REVIEW_LIST,
            };
            getApisWithAuth(reviewReqObj, function (err, reviewsRes) {
                var reviews = { items: [] };
                if (!err) {
                    reviews = JSON.parse(reviewsRes);
                }
                var favFilters = {
                    status: 1,
                    itemId: product.mysqlProductId,
                    userId: userId
                };
                Favourite.countDocuments(favFilters).then(isFav => {
                    isFav = isFav ? true : false;

                    product.imageBase = storeConfig.imageBase || "";
                    product.reviews = reviews || [];
                    product.relatedProducts = relatedProducts || [];
                    // product.specifications = Object.keys(product.specifications).map(function (key) {
                    //     return { "key": String(key), "value": String(product.specifications[key]) };
                    // });
                    product.sharingUrl = product.sharingUrl ? product.sharingUrl : utilities.getSharingUrl("product", productId);
                    product.isFav = isFav;
                    res.send(product);

                });

            });
        });
    });


}

//store
exports.products =  (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    let bearer = req.headers['authorization'];
    var params = req.query;
    getProducts(params, function (result) {
        if (res)
            res.send(result);
    });
}


exports.banners =  (req, res) => {
    var params = req.params;
    getBanners({}, function (result) {
        res.send(result);
    });

};

exports.summary =  (req, res) => {
    let bearer = req.headers['authorization'];
    var summary = [];
    getBanners({}, function (bannersResult) {
        var banners = { items: [] };
        if (bannersResult) {
            banners = bannersResult;
        }
        var params = { perPage: 10 };
        let relatedCategoriesReqObj = {
            page: 1,
            perPage : 10,
            bearer,
            url : constants.API_PRODUCTS_CATEGORIES,
        };
        getApisWithAuth(relatedCategoriesReqObj, function (err, categoriesResult) {
            var categories = { items: [] };
            if (categoriesResult) {
                categories = JSON.parse(categoriesResult);
            }
            let trendingProductsReqObj = {
                page: 1,
                perPage : 10,
                bearer,
                url : constants.API_PRODUCTS,
            };
            getApisWithAuth(trendingProductsReqObj, function (err, trendingProductsResult) {
                var trendingProducts = { items: [] };
                if (trendingProductsResult) {
                    trendingProducts = JSON.parse(trendingProductsResult);
                }
                let adsReqObj = {
                    page: 1,
                    perPage : 10,
                    bearer,
                    url : constants.API_ADS_LIST,
                };
                getApisWithAuth(adsReqObj, function (err, adsResult) {
                    var ads = { items: [] };
                    if (adsResult) {
                        ads = JSON.parse(adsResult);
                        var bannersSummary = {
                            imageBase: banners.imageBase,
                            items: banners.items
                        };
                        var categoriesSummary = {
                            imageBase: categories.imageBase,
                            items: categories.items
                        }
                        var appAd = {
                            imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
                            image: "app-screen.png",
                            playStoreButton: "play-store.png",
                            appStoreButton: "app-store.png",
                            title: "Download our Mobile app for better experience",
                            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, sit facere. Quasi dolorem odio magnam ratione. Ea quasi expedita fugit unde aut cum adipisci facilis culpa, maiores debitis assumenda perferendis."
                        }
                        var storeSummary = {
                            banners: bannersSummary,
                            categories: categoriesSummary,
                            appAd: appAd,
                            items: []
                        }
                        storeSummary.items.push({
                            type: 'products',
                            title: 'Top Products',
                            imageBase: trendingProducts.imageBase,
                            totalItems: trendingProducts.totalItems,
                            items: trendingProducts.items
                        });
                        storeSummary.items.push({
                            type: 'products',
                            title: 'Trending Products',
                            imageBase: trendingProducts.imageBase,
                            totalItems: trendingProducts.totalItems,
                            items: trendingProducts.items
                        });
                        storeSummary.items.push({
                            type: 'ads',
                            title: 'Advertsiements',
                            imageBase: ads.imageBase,
                            totalItems: ads.totalItems,
                            items: ads.items
                        });
                        shuffleArray(storeSummary.items);
                        res.send(storeSummary);
                    }
                });
            });
        });
    });

}
exports.summaryForWeb =  (req, res) => {
    let bearer = req.headers['authorization'];
    var summary = [];
    getBanners({}, function (bannersResult) {
        var banners = { items: [] };
        if (bannersResult) {
            banners = bannersResult;
        }
        var params = { perPage: 10 };
        let relatedCategoriesReqObj = {
            page: 1,
            perPage : 10,
            bearer,
            url : constants.API_PRODUCTS_CATEGORIES,
        };
        getApisWithAuth(relatedCategoriesReqObj, function (err, categoriesResult) {
            var categories = { items: [] };
            if (categoriesResult) {
                categories = JSON.parse(categoriesResult);
            }
            let trendingProductsReqObj = {
                page: 1,
                perPage : 10,
                bearer,
                url : constants.API_PRODUCTS,
            };
            getApisWithAuth(trendingProductsReqObj, function (err, trendingProductsResult) {
                var trendingProducts = { items: [] };
                if (trendingProductsResult) {
                    trendingProducts = JSON.parse(trendingProductsResult);
                };
                let adsReqObj = {
                    page: 1,
                    perPage : 10,
                    bearer,
                    url : constants.API_ADS_LIST,
                };
                getApisWithAuth(adsReqObj, function (err, adsResult) {
                    var ads = { items: [] };
                    if (adsResult) {
                        ads = JSON.parse(adsResult);

                        items = [];
                        items.push({
                            type: "banner",
                            title: "Banners",
                            imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
                            items: [{
                                image: "banner-1.png",
                                link: "store.com/product1"
                            }, {
                                image: "banner-2.png",
                                link: "store.com/product2"
                            }]
                        });
                        items.push({
                            type: "product",
                            title: "Suggested Products",
                            imageBase: trendingProducts.imageBase,
                            items: trendingProducts.items,
                            totalItems: trendingProducts.totalItems
                        });

                        items.push({
                            type: "app-ad",
                            title: "Download our mobile app for better experience",
                            imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
                            image: "app-screen.png",
                            links: [{
                                icon: "play-store.png",
                                url: "playstoreurl.com"
                            }, {
                                icon: "app-store.png",
                                url: "appstoreurl.com"
                            }],
                            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, sit facere. Quasi dolorem odio magnam ratione. Ea quasi expedita fugit unde aut cum adipisci facilis culpa, maiores debitis assumenda perferendis."
                        });

                        items.push({
                            type: "product",
                            title: "Trending Products",
                            imageBase: trendingProducts.imageBase,
                            items: trendingProducts.items,
                            totalItems: trendingProducts.totalItems
                        });
                        items.push({
                            type: "advertisement",
                            title: "Advertisements",
                            imageBase: ads.imageBase,
                            items: ads.items,
                            totalItems: ads.totalItems
                        });
                        items.push({
                            type: "product",
                            title: "Top Selling Products",
                            imageBase: trendingProducts.imageBase,
                            items: trendingProducts.items,
                            totalItems: trendingProducts.totalItems
                        });
                        items.push({
                            type: "category",
                            title: "Product Categories",
                            imageBase: categories.imageBase,
                            items: categories.items,
                            totalItems: categories.totalItems
                        });

                        var summary = {
                            items: items
                        }
                        res.send(summary);
                    }
                });
            });
        });
    });

};

