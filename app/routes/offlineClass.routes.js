const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');

var classConfig = config.offlineclass;

var storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        
        if (file.fieldname === "image") {
            cb(null, classConfig.imageUploadPath.trim());
        }  else {
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
    app.post('/offline-class/add-institution', fileUpload.single('image'), auth, offlineClass.createInstitution);
    app.get('/offline-class/courses',  auth, offlineClass.getCources);
    app.get('/offline-class/home',  auth, offlineClass.listInstitutesAtHome);
    app.get('/offline-class/home-see-more',  auth, offlineClass.homeSeeMore);
    app.get('/offline-class/detail-institutes/:id',  auth, offlineClass.detailInstitution);
    app.post('/offline-class/add-institution-enquiry',  auth, offlineClass.addEnquiry);
    app.get('/offline-class/list-enquiry/:id',  auth, offlineClass.listEnquiry);
    app.patch('/offline-class/edit-institution/:id',  auth, offlineClass.editInstitution);
}