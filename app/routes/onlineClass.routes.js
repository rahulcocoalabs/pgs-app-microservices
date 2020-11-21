const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');


var classConfig = config.class;

var storage = multer.diskStorage({
    // destination: usersConfig.imageUploadPath,
    destination: function (req, file, cb) {
            cb(null, classConfig.imageUploadPath.trim());
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
    const contests = require('../controllers/onlineClass.controller');
    app.post('/online-class/add',fileUpload.single('image'), auth,contests.createOnlineClass);
    app.get('/online-class/:id/detail', auth,contests.getClassDetails);
    app.get('/online-class/list', auth,contests.listOnlineClasses);
    app.get('/online-class/tutor/list', auth,contests.listTutorList);
    app.get('/online-class/student/home', auth,contests.getStudentHome);
    app.get('/online-class/tutor/:id/detail', auth,contests.getTutorDetails);


}