const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    notificationId: {type: mongoose.Schema.Types.ObjectId, ref: 'Notification'},
    isRead: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('NotificationStatus',notificationSchema, 'NotificationsStatus');