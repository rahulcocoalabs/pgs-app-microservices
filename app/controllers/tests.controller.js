var gateway = require('../components/gateway.component.js');
const Test = require('../models/test.model.js');
const TestCategory = require('../models/testCategory.model.js');
const TestQuestion = require('../models/testQuestion.model.js');
const TestQuestionOption = require('../models/testQuestionOption.model.js');
const TestResult = require('../models/testResult.model.js');
var config = require('../../config/app.config.js');
var constants = require('../helpers/constants');
var testsConfig = config.tests;
var moment = require('moment');
const {
  ObjectId
} = require('mongodb');

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


  exports.listAllTests = (req, res) => {
    var filters = {
      status: 1
    };
    var queryProjection = {
      title: 1,
      image: 1,
      amount: 1
    };


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || testsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : testsConfig.resultsPerPage;
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

    Test.find(filters, queryProjection, pageParams).sort(sortOptions).limit(perPage).then(testsList => {
      Test.countDocuments(filters, function (err, itemsCount) {
        var i = 0;
        var items = [];

        var itemsCountCurrentPage = testsList.length;
        for (i = 0; i < itemsCountCurrentPage; i++) {

          items.push({
            id: testsList[i]._id,
            title: testsList[i].title || null,
            image: testsList[i].image || null,
            amount: testsList[i].amount || null
          });
        }
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var responseObj = {
          imageBase: testsConfig.imageBase,
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

  exports.getSummary = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let testReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_TEST
    };
    getApisWithAuth(testReqObj, function (err, testsResult) {
      var tests = {
        items: []
      };
      if (!err) {
        tests = JSON.parse(testsResult);
      }
      let talentTestReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_TEST
      };
      getApisWithAuth(talentTestReqObj, function (err, talentTestsResult) {
        var talentTests = {
          items: []
        };
        if (!err) {
          talentTests = JSON.parse(talentTestsResult);
        }
        let gkTestReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_TEST
        };
        getApisWithAuth(gkTestReqObj, function (err, gkTestsResult) {
          var gkTests = {
            items: []
          };
          if (!err) {
            gkTests = JSON.parse(gkTestsResult);
          }
          let adsReqObj = {
            page: 1,
            perPage: 10,
            bearer,
            url: constants.API_ADS_LIST
          };
          getApisWithAuth(adsReqObj, function (err, adsResult) {
            var ads = {
              items: []
            };
            if (!err) {
              ads = JSON.parse(adsResult);

              var testsSummary = {
                imageBase: tests.imageBase,
                totalItems: tests.totalItems,
                items: tests.items
              }
              var talentTestsSummary = {
                imageBase: talentTests.imageBase,
                totalItems: talentTests.totalItems,
                items: talentTests.items
              }
              var gkTestsSummary = {
                imageBase: gkTests.imageBase,
                totalItems: gkTests.totalItems,
                items: gkTests.items
              }
              var adsSummary = {
                imageBase: ads.imageBase,
                totalItems: ads.totalItems,
                items: ads.items
              }
              summary.tests = testsSummary;
              summary.talentTests = talentTestsSummary;
              summary.coachingClasses = gkTestsSummary;
              summary.gkTests = gkTestsSummary;
              summary.ads = adsSummary;
              summary.appAd = {
                imageBase: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/",
                image: "app-screen.png",
                playStoreButton: "play-store.png",
                appStoreButton: "app-store.png",
                title: "Download our Mobile app for better experience",
                description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, sit facere. Quasi dolorem odio magnam ratione. Ea quasi expedita fugit unde aut cum adipisci facilis culpa, maiores debitis assumenda perferendis."
              };
              res.send(summary);
            }
          });
        });
      });
    });


  }


  exports.getSummaryForWeb = (req, res) => {
    var summary = {};
    let bearer = req.headers['authorization'];
    let testReqObj = {
      page: 1,
      perPage: 10,
      bearer,
      url: constants.API_TEST
    };
    getApisWithAuth(testReqObj, function (err, testsResult) {
      var tests = {
        items: []
      };
      if (!err) {
        tests = JSON.parse(testsResult);
      }
      let talentTestReqObj = {
        page: 1,
        perPage: 10,
        bearer,
        url: constants.API_TEST
      };
      getApisWithAuth(talentTestReqObj, function (err, talentTestsResult) {
        var talentTests = {
          items: []
        };
        if (!err) {
          talentTests = JSON.parse(talentTestsResult);
        };
        let gkTestReqObj = {
          page: 1,
          perPage: 10,
          bearer,
          url: constants.API_TEST
        };
        getApisWithAuth(gkTestReqObj, function (err, gkTestsResult) {
          var gkTests = {
            items: []
          };
          if (!err) {
            gkTests = JSON.parse(gkTestsResult);
          }
          let adsReqObj = {
            page: 1,
            perPage: 10,
            bearer,
            url: constants.API_ADS_LIST
          };
          getApisWithAuth(adsReqObj, function (err, adsResult) {
            var ads = {
              items: []
            };
            if (!err) {
              ads = JSON.parse(adsResult);

              var items = [];

              items.push({
                type: "test",
                title: "Aptitude Tests",
                imageBase: tests.imageBase,
                items: tests.items,
                totalItems: tests.totalItems
              });


              items.push({
                type: "test",
                title: "Talent Tests",
                imageBase: talentTests.imageBase,
                items: talentTests.items,
                totalItems: talentTests.totalItems
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
                type: "test",
                title: "Coaching Classes",
                imageBase: talentTests.imageBase,
                items: talentTests.items,
                totalItems: talentTests.totalItems
              });

              items.push({
                type: "advertisement",
                title: "Advertisements",
                imageBase: ads.imageBase,
                items: ads.items,
                totalItems: ads.totalItems
              });

              items.push({
                type: "test",
                title: "General Knowledge Tests",
                imageBase: gkTests.imageBase,
                items: gkTests.items,
                totalItems: gkTests.totalItems
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


  }

  exports.getTestDetail = (req, res) => {

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
      testType: 1,
      title: 1,
      image: 1,
      images: 1,
      description: 1,
      amount: 1,
      isFav: 1
    }
    // get data
    Test.findOne(filters, queryProjection).then(test => {
      if (!test) {
        var responseObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "Test not found with id"
          }]
        }
        res.send(responseObj);
        return;
      }
      var questionFilter = {
        status: 1,
        testId: id
      }
      TestQuestion.countDocuments(questionFilter, function (err, itemsCount) {
        var testDetail = {
          id: id || null,
          imageBase: testsConfig.imageBase || "",
          testType: test.testType || null,
          title: test.title || null,
          image: test.image || null,
          images: test.images || [],
          description: test.description || null,
          amount: test.amount || null,
          questionsCount: itemsCount || null,
          isFav: itemsCount.isFav
        }
        res.send(testDetail);
      });

    });

  }

  exports.getQuestions = (req, res) => {
    var testId = req.params.id;

    var errors = [];
    if (!testId) {
      errors.push({
        field: "testId",
        message: "testId is missing"
      });
    }
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(testId);
    if (!isValidId) {
      errors.push({
        field: "testId",
        message: "testId is invalid"
      });
    }

    if (errors.length) {
      return res.status(200).send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    var filters = {
      status: 1,
      testId: testId
    }
    var queryProjection = {
      title: 1,
      optionIds: 1,
      options: 1
    }
    TestQuestion.find(filters, queryProjection).populate({
      path: 'optionIds',
      select: 'title status sortOrder id'
    }).then(testQuestions => {
      res.send(testQuestions);
    });
  }

  exports.saveTestResult = (req, res) => {

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    params.testId = req.params.id;
    var answers = params.answers;
    if (!params.testId || !params.answers) {
      errors = [];
      if (!params.testId) {
        errors.push({
          field: "testid",
          message: "TestId cannot be empty"
        });
      }
      if (!params.answers) {
        errors.push({
          field: "answers",
          message: "Answers cannot be empty"
        });
      }
      return res.status(200).send({
        success: 0,
        errors: errors,
        code: 200
      });
    };
    var filters = {
      userId: userId,
      testId: params.testId,
      status: 1,
    }
    TestResult.countDocuments(filters).then(result => {
      if (result) {
        var responseErrorObj = {
          success: 0,
          status: 200,
          errors: [{
            field: "id",
            message: "userId already attended the test"
          }]
        }
        res.send(responseErrorObj);
        return;
      }
      testSubmit(userId)
    })

    function testSubmit(userId) {
      var findCriteria = {
        testId: params.testId
      }
      TestQuestion.find(findCriteria).then(testQuestions => {
        if (!testQuestions) {
          var responseObj = {
            success: 0,
            status: 200,
            errors: [{
              field: "id",
              message: "Test questions not found with id"
            }]
          }
          res.send(responseObj);
          return;
        }
        var i = 0;
        var itemsLength = testQuestions.length;
        var points = {};
        var point;
        var qId;
        var qn;
        for (i = 0; i < itemsLength; i++) {

          qn = testQuestions[i];
          point = qn.points;
          qId = qn._id;
          points[qId] = point;
        }
        var i = 0;
        var ln = answers.length;
        var testQuestionId;
        var pnt;
        var ts;
        var records = [];
        var record;
        while (i < ln) {
          answer = answers[i++];
          ts = moment().unix();
          testQuestionId = answer.questionId;
          pnt = points[testQuestionId] ? points[testQuestionId] : 0;
          record = {
            userId: userId,
            testId: params.testId,
            testQuestionId: testQuestionId,
            testQuestionOptionId: answer.optionId,
            points: pnt,
            status: 1,
            tsCreatedAt: ts,
            tsModifiedAt: ts
          };
          records.push(record);

        }
        TestResult.insertMany(records, async function (err, results) {
          if (err) {
            res.status(500).send({
              success: 0,
              status: 500,
              message: err.message || "Some error occurred while submitting test result."
            });

          } else {
            let respObj = await calculatePointsOfAttendedTests(userId, params.testId);

            var formattedData = {
              success: 1,
              message: "Test result submitted",
              score: respObj.score,
              outOfTotal: respObj.outOfTotal,
            };
            res.send(formattedData);
          }

        })

      });


    }
  }

  exports.updateTestResult = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    params.testId = req.params.id;
    let answerArray = params.answers;

    if (!params.testId || !params.answers) {
      errors = [];
      if (!params.testId) {
        errors.push({
          field: "testid",
          message: "TestId cannot be empty"
        });
      }
      if (!params.answers) {
        errors.push({
          field: "answers",
          message: "Answers cannot be empty"
        });
      }
      return res.status(200).send({
        success: 0,
        errors: errors,
        code: 200
      });
    };

    let success = await updateTestResult(answerArray, params, userId);
    if (success) {
      let respObj = await calculatePointsOfAttendedTests(userId, params.testId);

      var updatedResponse = {
        success: 1,
        message: "Test result updated",
        score: respObj.score,
        outOfTotal: respObj.outOfTotal,
      };
      res.send(updatedResponse);
    } else {
      var updatedResponse = {
        success: 0,
        message: "Error occured after update.."
      };
      res.send(updatedResponse);
    }
  }
  async function updateTestResult(answerArray, params, userId) {
    try {
      await answerArray.forEach(async function (obj) {
        let testData = await TestResult.findOne({
          testId: params.testId,
          userId: userId,
          testQuestionId: obj.questionId
        })

        testData.testQuestionOptionId = obj.optionId;
        testData.save();
      });
      return true;
    } catch (err) {
      return false;
    }

  }
  exports.listAttendedTests = async (req, res) => {
    // Needs to be changed

    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || testsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : testsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
      skip: offset,
      limit: perPage
    };
    let countData = await TestResult.aggregate([{
        "$match": {
          "userId": ObjectId(userId)
        }
      },
      {
        "$group": {
          _id: "$testId",
          questionCount: {
            $sum: 1
          }
        }
      },
      {
        "$lookup": {
          "from": "Tests",
          "localField": "_id",
          "foreignField": "_id",
          "as": "items"
        }
      },
      {
        "$unwind": {
          path: "$items",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          items: "$items"
        }
      }

    ]);
    let itemsCount = countData.length;
    let testData = await TestResult.aggregate([{
        "$match": {
          "userId": ObjectId(userId)
        }
      },
      {
        "$group": {
          _id: "$testId",
          questionCount: {
            $sum: 1
          }
        }
      },
      {
        "$lookup": {
          "from": "Tests",
          "localField": "_id",
          "foreignField": "_id",
          "as": "items"
        }
      },
      {
        "$unwind": {
          path: "$items",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          items: "$items",
          questionCount: "$questionCount",
          score: "$points"
        }
      },
      {
        '$facet': {
          metadata: [{
            $count: "total"
          }, {
            $addFields: {
              page: page
            }
          }],
          data: [{
            $skip: pageParams.skip
          }, {
            $limit: pageParams.limit
          }]
        }
      }
    ]);
    let result = [];
    for (let i = 0; i < testData[0].data.length; i++) {
      let itemData = testData[0].data[i].items;
      let itemTestData = {};

      itemTestData.id = itemData._id;
      itemTestData.title = itemData.title;
      itemTestData.image = itemData.image;
      itemTestData.questionCount = testData[0].data[i].questionCount;
      itemTestData.coinCount = 0;

      // itemTestData.points = itemData.score || 0;
      let respObj = await calculatePointsOfAttendedTests(userId, itemData._id);


      itemTestData.score = respObj.score || 0;
      itemTestData.outOfTotal = respObj.outOfTotal;
      result.push(itemTestData);
    }
    totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var responseObj = {
      imageBase: testsConfig.imageBase,
      items: result,
      page: page,
      perPage: perPage,
      hasNextPage: hasNextPage,
      totalItems: itemsCount,
      totalPages: totalPages
    }
    res.send(responseObj)

  }

  exports.detailsAttendedTests = async (req, res) => {

    var userData = req.identity.data;
    var userId = userData.userId;
    var testId = req.params.id;
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(testId);
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: [{
          field: "TestId",
          message: "TestId is invalid"
        }]
      }
      res.send(responseObj);
      return;
    }
    let questionsData = await TestQuestion.find({
      testId: testId
    }).lean()

    let testDetails = await Test.findById({
      _id: testId
    }).lean()

    let totalQuestionCOunt = await TestQuestion.find({
      testId: testId
    }).count()

    let itemData = [];

    let testQuestionData = await TestResult.find({
      testId: testId,
      userId: userId
    }, {
      testQuestionOptionId: 1
    }).lean();

    await Promise.all(questionsData.map(async (optionItem) => {
      let optionObj = {}
      let testQuestionOptionId = "";
      let optionData = await TestQuestionOption.find({
        _id: {
          $in: optionItem.optionIds
        }
      }, {
        title: 1,
        _id: 1,
        isCorrect: 1
      }).lean();
      for (let i = 0; i < testQuestionData.length; i++) {
        let obj = optionItem.optionIds.find(o => JSON.stringify(o) === JSON.stringify(testQuestionData[i].testQuestionOptionId));
        if (obj) {
          testQuestionOptionId = testQuestionData[i].testQuestionOptionId;
          break;
        }
      }

      for (let i = 0; i < optionData.length; i++) {
        optionData[i].isSelected = false;
        if (optionData[i].isCorrect === 'on' || optionData[i].isCorrect === "true") {
          optionData[i].isCorrect = true;
        } else if (optionData[i].isCorrect === "" || optionData[i].isCorrect === "false") {
          optionData[i].isCorrect = false;
        }
        if (testQuestionOptionId) {
          if (JSON.stringify(optionData[i]._id) == JSON.stringify(testQuestionOptionId)) {
            optionData[i].isSelected = true;
          }
        }
      }
      optionObj.options = optionData;
      optionObj.question = optionItem.title;
      itemData.push(optionObj);
    }));
    let itemObj = {};
    itemObj.imageBase = testsConfig.imageBase;
    itemObj.success = 1;
    itemObj.items = itemData;
    itemObj.questionCount = totalQuestionCOunt;
    itemObj.testType = testDetails.testType;
    itemObj.amount = testDetails.amount;
    res.send(itemObj)

  }

  async function calculatePointsOfAttendedTests(userId, testId) {
    let questionsData = await TestQuestion.find({
      testId: testId
    }).lean();


    let testQuestionData = await TestResult.find({
      testId: testId,
      userId: userId
    }, {
      testQuestionOptionId: 1,
      testQuestionId: 1,
    }).lean();
    let score = 0;
    let respObj = {};
    let outOfTotal = 0;

    await Promise.all(questionsData.map(async (optionItem) => {
      let testQuestionOptionId;
      outOfTotal = outOfTotal + parseInt(optionItem.points);
      respObj.outOfTotal = outOfTotal;
      let optionData = await TestQuestionOption.find({
        _id: {
          $in: optionItem.optionIds
        }
      }).lean();

      for (let i = 0; i < testQuestionData.length; i++) {
        for (let j = 0; j < optionData.length; j++) {
          if (JSON.stringify(testQuestionData[i].testQuestionOptionId) === JSON.stringify(optionData[j]._id)) {
            testQuestionOptionId = testQuestionData[i].testQuestionOptionId;
            break;
          }
        }
      }

      for (let i = 0; i < optionData.length; i++) {
        optionData[i].isSelected = false;
        if (optionData[i].isCorrect === 'on' || optionData[i].isCorrect === "true") {
          optionData[i].isCorrect = true;
        } else if (optionData[i].isCorrect === "" || optionData[i].isCorrect === "false") {
          optionData[i].isCorrect = false;
          continue;
        }
        if (testQuestionOptionId) {
          if (JSON.stringify(optionData[i]._id) == JSON.stringify(testQuestionOptionId)) {
            optionData[i].isSelected = true;
          }
        }

        if (optionData[i].isCorrect === true && optionData[i].isSelected === true) {
          score = score + parseInt(optionItem.points);
        }
      }
    }));
    respObj.score = score;

    return respObj;
  }

