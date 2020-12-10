const OneSignal = require('onesignal-node');
var config = require('../../config/app.config.js');
var PushNotification = require('../models/pushNotification.model');
var Notification = require('../models/notification.model');
var Settings = require('../models/setting.model');
// var Church = require('../models/church.model');
var constants = require('../helpers/constants');
// var oneSignalConfig = config.oneSignal;

module.exports = {
    sendNotification: async function (notificationObj) {
        var onesignalApiKey = ""
        var onesignalAppId = ""
        var filterCriteria = {
            key : constants.ONE_SIGNAL_API_KEY,
            status: 1
        }
        var settingsData = await Settings.findOne(filterCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting e commerce manager config data',
                    error: err
                }
            })

        if (settingsData && (settingsData.success !== undefined) && (settingsData.success === 0)) {
            return res.send(settingsData);
        }
        if(settingsData){
            onesignalApiKey = settingsData.value;
            var filterCriteria = {
                key : constants.ONE_SIGNAL_APP_ID,
                status: 1
            }
            settingsData = await Settings.findOne(filterCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting e commerce manager config data',
                    error: err
                }
            })

        if (settingsData && (settingsData.success !== undefined) && (settingsData.success === 0)) {
            return res.send(settingsData);
        }
        if(settingsData){
            onesignalAppId = settingsData.value;

        const oneSignalClient = new OneSignal.Client(onesignalAppId,onesignalApiKey);

        var notificationData = {
            // contents: message,
            contents: {
                "tr": notificationObj.message,
                "en": notificationObj.message,
            },
            headings: {
                "en": notificationObj.title
            },
            subtitle: {
                "en": notificationObj.message,
            },
            data: {
                "type": notificationObj.type,
                "reference_id": notificationObj.referenceId,
            }
            ,
            included_segments: null,
            filters: notificationObj.filtersJsonArr
        };
    
        // using async/await
        try {
        const response = await oneSignalClient.createNotification(notificationData);

        var notificationLogObj = {};
        notificationLogObj.type = notificationObj.type;
        notificationLogObj.title = notificationObj.title;
        notificationLogObj.messageText = notificationObj.message;
        notificationLogObj.filtersJsonArr = notificationObj.filtersJsonArr;
        if (notificationObj.userId) {
            notificationLogObj.userId = notificationObj.userId;
        }

        notificationLogObj.referenceId = notificationObj.referenceId;
        notificationLogObj.metaInfo = null;
        // notificationLogObj.isSent = 0;
        // notificationLogObj.sentAt = new Date();
        notificationLogObj.sentAt = Date.now();
        notificationLogObj.status = 1;
        notificationLogObj.tsCreatedAt = Date.now();
        notificationLogObj.tsModifiedAt = null;
        var logObj = new PushNotification(notificationLogObj);
        var notificationData = await logObj.save()
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while saving push notifocation log',
                    error: err
                }
            })
        if (notificationData && (notificationData.success !== undefined) && (notificationData.success === 0)) {
            return notificationData;
        }
        
        var newNotificationObj = {};
        newNotificationObj.title = notificationObj.title;
        newNotificationObj.content = notificationObj.message;
        newNotificationObj.type = notificationObj.type;
        newNotificationObj.referenceId = notificationObj.referenceId;
        newNotificationObj.notificationType = notificationObj.notificationType;
        if(notificationObj.notificationType === constants.INDIVIDUAL_NOTIFICATION_TYPE){
            notificationObj.userId = notificationObj.userId;
        }else{
            // notificationObj.userIds = notificationObj.userIds;
        }
        newNotificationObj.markAsRead = false;
        newNotificationObj.status = 1;
        newNotificationObj.tsCreatedAt = Date.now();
        newNotificationObj.tsModifiedAt = null;

        var saveNotificationObj = new Notification(newNotificationObj);
        var newNotificationData = await saveNotificationObj.save()
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while saving new notification',
                error: err
            }
        })
    if (newNotificationData && (newNotificationData.success !== undefined) && (notificationData.success === 0)) {
        return newNotificationData;
    }
        return notificationData;

        } catch (e) {
            console.log("e")
            console.log(e)
            console.log("e")
            if (e instanceof OneSignal.HTTPError) {
                // When status code of HTTP response is not 2xx, HTTPError is thrown.
                console.log(e.statusCode);
                console.log(e.body);
            }
            return e;

        }
    }else{
        return {
            message : 'Push notification not implemented',
            status : 1
        };
    }
    }else{
        return {
            message : 'Push notification not implemented',
            status : 1
        };
    }

    },

}