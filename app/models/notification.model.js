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
    type: String,
    typeId:String,
    referenceId : String,
    notificationType: String,
    userId :  {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    readUserIds :  [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    markAsRead: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
},options)

module.exports = mongoose.model('Notification',notificationSchema, 'Notifications');