const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');

var classConfig = config.offlineclass;

var storage = multer.diskStorage({
    // destination: usersConfig.imageUploadPath,
    destination: function (req, file, cb) {
        // cb(null, classConfig.imageUploadPath.trim());
        if (file.fieldname === "image") {
            cb(null, classConfig.imageUploadPath.trim());
        } else if (file.fieldname === "video") {
            cb(null, classConfig.videoUploadPath.trim());
        } else {
            return cb({ success: 0, message: "Invalid types" });
        }
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + "." + mime.extension(file.mimetype))
        })
    }
});

var fileUpload = multer({ storage: storage });

module.exports = (app) => {
    const offlineClass = require('../controllers/offlineClass.controller');
    app.post('/offline-class/add-institution', fileUpload.field( {
        name: 'image', maxCount: 1
    }), auth, offlineClass.addInstitution);
    
}