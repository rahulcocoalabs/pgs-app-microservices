  const Advertisement = require('../models/advertisement.model.js');
  const AdvertisementProvider = require('../models/adProvider.model.js');
  var config = require('../../config/app.config.js');
  var adsConfig = config.ads;

  exports.getAds = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    console.log(userId);
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || adsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : adsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };

    var nationalityId = params.nationalityId;
    var genderId = params.genderId;

    var queryProjection = {
      title: 1,
      image: 1,
      thumbnail: 1,
      link: 1,
      provider: 1
    }

    var filters = {
      status: 1
    };

    var sortOptions = {};

    Advertisement.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).populate('provider').then(adsList => {
      Advertisement.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var len = adsList.length;
        var items = [];
        while (i < len) {
          items.push({
            id: adsList[i].id,
            title: adsList[i].title || "",
            image: adsList[i].image || "",
            thumbnail: adsList[i].thumbnail || adsConfig.defaultThumbnail,
            provider: adsList[i].provider
          });
          i++;
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: adsConfig.imageBase,
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

