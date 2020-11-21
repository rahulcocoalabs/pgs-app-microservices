const Users = require('../models/user.model');
const Shops = require('../models/shop.model');
const ShopProducts = require('../models/shopProduct.model');
const config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const contestsConfig = config.contests;
const shopProductsConfig = config.shopProducts;
const relatedProductsConfig = config.relatedProducts;
const ObjectId = require('mongoose').Types.ObjectId;
const ShopProductRequests = require('../models/shopProductRequest.model');
// *** List all products ***
exports.listShopProducts = async (req, res) => {
    // var userData = req.identity.data;
    // var userId = userData.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || shopProductsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : shopProductsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    var filter = {
        isActive: true,
        status: 1
    };

    var shopProductsList = await ShopProducts.find(filter)
        .populate([{
            path: 'shopId',
            select: {
                name: 1,
                address: 1,
                phone: 1
            }
        }])
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing shop products',
                error: err
            }
        })
    if (shopProductsList && (shopProductsList.success !== undefined) && (shopProductsList.success === 0)) {
        return res.send(shopProductsList);
    }
    var shopProductsCount = await ShopProducts.countDocuments(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding total shop products',
                error: err
            }
        })
    if (shopProductsCount && (shopProductsCount.success !== undefined) && (shopProductsCount.success === 0)) {
        return res.send(shopProductsCount);
    }
    totalPages = shopProductsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: shopProductsCount,
        totalPages: totalPages
    };
    return res.status(200).send({
        success: 1,
        pagination: pagination,
        items: shopProductsList,
        imageBase: shopProductsConfig.imageBase,

    });

}




// *** Product detail ***
exports.shopProductDetail = async (req, res) => {
    // var userData = req.identity.data;
    // var userId = userData.id;
    var productId = req.params.id;
    var productData = await ShopProducts.findOne({
        _id: productId,
        isActive: true,
        status: 1
    })
        .populate([{
            path: 'shopId',
            select: {
                name: 1,
                address: 1,
                phone: 1
            }
        }])
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding total shop products',
                error: err
            }
        })
    if (productData && (productData.success !== undefined) && (productData.success === 0)) {
        return res.send(productData);
    }
    if (productData) {
        var relatedFindCriteria = {};
        relatedFindCriteria = {
            _id : { 
                $nin : [productId]
            }
        };
        relatedFindCriteria.isActive = true;
        relatedFindCriteria.status = 1;
         var relatedProductList = await ShopProducts.find(relatedFindCriteria)
         .populate([{
            path: 'shopId',
            select: {
                name: 1,
                address: 1,
                phone: 1
            }
        }])
        .limit(relatedProductsConfig.limit)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while loading related products',
                error: err
            }
        })
    if (relatedProductList && (relatedProductList.success !== undefined) && (relatedProductList.success === 0)) {
        return res.send(relatedProductList);
    }
        return res.send({
            success: 1,
            imageBase: shopProductsConfig.imageBase,
            item: productData,
            relatedProducts : relatedProductList,
            message: 'Product details'
        })
    } else {
        return res.send({
            success: 0,
            message: "Product not exists"
        })
    }
}
// *** Product detail ***

exports.redeemShopProduct = async (req, res) => {
    var productId = req.params.id;
    var productData = await ShopProducts.findOne({
        _id: productId,
        isActive: true,
        status: 1
    })
        .populate([{
            path: 'shopId',
            select: {
                name: 1,
                address: 1,
                phone: 1
            }
        }])
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding total shop products',
                error: err
            }
        })
    if (productData && (productData.success !== undefined) && (productData.success === 0)) {
        return res.send(productData);
    }
    if (productData) {
        var data = req.identity.data;
        var userId = data.userId;
        var findCriteria = {
            _id: userId,
            status: 1
        }
   
        var userData = await Users.findOne(findCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting user details',
                    error: err
                }
            })
        if (userData && (userData.success !== undefined) && (userData.success === 0)) {
            return res.send(userData);
        }
        if (userData) {
            var params = req.body;
            var quantity = 1;
            if (params.quantity != undefined) {
                quantity = parseInt(params.quantity);
            }
            var coinCount = userData.coinCount || 0;
            var productCoin = (productData.point * quantity);
            var quantity = params.quantity || 1;
            if (coinCount >= productCoin) {
                var productRequest = {};
                productRequest.userId = userId;
                productRequest.shopProductId = productData.id;
                productRequest.shopId = productData.shopId;
                productRequest.quantity = quantity;
                productRequest.point = productCoin;
                productRequest.price = productData.price;
                productRequest.requestStatus = constants.PENDING_SHOP_PRODUCT_REQUEST;
                productRequest.status = 1;
                productRequest.tsCreatedAt = Date.now();
                productRequest.tsModifiedAt = null;
                var newProductRequest = new ShopProductRequests(productRequest);
                var productRequestData = await newProductRequest.save()
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while redeem coin',
                            error: err
                        }
                    })
                if (productRequestData && (productRequestData.success !== undefined) && (productRequestData.success === 0)) {
                    return res.send(productRequestData);
                }
                console.log("findCriteria")
                console.log(findCriteria)
                console.log("findCriteria")
                console.log("productCoin : " + productCoin)
                var userCoinUpdate = await Users.updateOne(findCriteria, { tsModifiedAt: Date.now(), $inc: { coinCount: (productCoin * -1) } })
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while redeem coin',
                            error: err
                        }
                    })
                if (userCoinUpdate && (userCoinUpdate.success !== undefined) && (userCoinUpdate.success === 0)) {
                    return res.send(userCoinUpdate);
                }
                 var coinData = await Users.findOne(findCriteria,{coinCount : 1})
                .catch(err => {
                    return {
                        success: 0,
                        message: 'Something went wrong while getting coin data',
                        error: err
                    }
                })
            if (coinData && (coinData.success !== undefined) && (coinData.success === 0)) {
                return res.send(coinData);
            }

                return res.send({
                    success: 1,
                    message: 'Coin reedemed succefully',
                    coinCount : coinData.coinCount
                })

            } else {
                var neededCoin = productCoin - coinCount;
                return res.send({
                    success: 0,
                    message: "Sorry  " + neededCoin + " coin needed"
                })
            }
        } else {
            return res.send({
                success: 0,
                message: "Invalid user"
            })
        }


    } else {
        return res.send({
            success: 0,
            message: "Product not exists"
        })
    }
}