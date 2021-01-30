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

var upload = multer({ storage: storage });

const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const alumni = require('../controllers/alumni.controller');

   app.post('/alumni/add',upload.single('image'),  alumni.addAlumni);
  
}