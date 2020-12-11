
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.feeds;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.files.images && !req.files.video && !req.files.documents)
            cb(null, feedsConfig.imageUploadPath);
        if (!req.files.images && req.files.video && !req.files.documents)
            cb(null, feedsConfig.videoUploadPath);
        if (!req.files.images && !req.files.video && req.files.documents)
            cb(null, feedsConfig.documentUploadPath);
        if (!(req.files.images && !req.files.video && !req.files.documents) && !(!req.files.images && req.files.video && !req.files.documents) && !(!req.files.images && !req.files.video && req.files.documents)) {
            return cb({success: 0, message: "You cannot post multiple types" });
        }
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err)
                return cb(err)
            cb(null, raw.toString('hex') + "." + mime.extension(file.mimetype))
        })
    }
});

var feedsUpload = multer({ storage: storage });

const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');
    app.get('/feeds',auth, feeds.listAll);
    app.get('/feeds/summary',auth,feeds.getSummary);
    app.get('/feeds/self',auth,feeds.getUserFeeds);
    app.get('/feeds/summary/v2',auth,feeds.getSummaryForWeb);
    app.post('/feeds',auth,feedsUpload.fields([{ name: 'images', maxCount: feedsConfig.maxImageCount }, { name: 'documents', maxCount: feedsConfig.maxDocumentsCount }, { name: 'video', maxCount: feedsConfig.maxVideoCount }]), feeds.createFeed);
    app.patch('/feeds/:id',auth,feedsUpload.fields([{ name: 'images', maxCount: feedsConfig.maxImageCount }, { name: 'documents', maxCount: feedsConfig.maxDocumentsCount }, { name: 'video', maxCount: feedsConfig.maxVideoCount }]), feeds.updateFeed);
    app.delete('/feeds/delete/:id',auth,feeds.deleteFeed);
    app.post('/feeds/emotion',auth,feeds.addEmotionToFeed);
    app.delete('/feeds/emotion',auth,feeds.removeEmotionFromFeed);
    app.get('/feeds/owner',auth,feeds.getOwnerPosts);

    //test
    app.get('/feeds/test',auth,feeds.getSummary1);
}


