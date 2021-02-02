var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.alumni;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "image"){
            cb(null, feedsConfig.imageUploadPath.trim());
        } else{
            return cb({success: 0, message: "Invalid types" });
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

   app.post('/alumni/add', auth,upload.single('image'),  alumni.addAlumni);
   app.get('/alumni/list',auth,  alumni.listAlumni);
   app.get('/alumni/details',auth,  alumni.details);
   app.post('/alumni/join-request', auth,  alumni.joinRequest);
  
}