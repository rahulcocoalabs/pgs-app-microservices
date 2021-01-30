var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.feeds;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.file.images)
            cb(null, feedsConfig.imageUploadPath);
      
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