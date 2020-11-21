const mongoose = require('mongoose');
function transform(item) {
  var ret =  item;
  ret.id = ret._id;
  delete ret._id;
}
var options = {
  toObject: {
      virtuals: true,
      transform: function (doc, ret) {
          transform(ret);
      }
  },
  toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
          transform(ret);
      }
  }
};
const notificationSchema = mongoose.Schema({
    title: String,
    content: String,
    userIds :  [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    sendStatus: String,
    params:[{
      key: String,
      value: String
    }],
    markAsRead: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
},options)

module.exports = mongoose.model('Notification',notificationSchema, 'Notifications');