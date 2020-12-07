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
    const onlineClass = require('../controllers/onlineClass.controller');
    app.post('/online-class/add',fileUpload.single('image'),fileUpload('video'), auth,onlineClass.createOnlineClass);
    app.get('/online-class/:id/detail', auth,onlineClass.getClassDetails);
    app.get('/online-class/list', auth,onlineClass.listOnlineClasses);
    app.get('/online-class/tutor/list', auth,onlineClass.listTutorList);
    app.get('/online-class/tutor/list-classes', auth,onlineClass.listClassForTutor);
    app.get('/online-class/tutor/list-requests', auth,onlineClass.listApointmentsForTutor);
    app.get('/online-class/student/home', auth,onlineClass.getStudentHome);
    app.get('/online-class/tutor/:id/detail', auth,onlineClass.getTutorDetails);
    app.post('/online-class/student/appointment', auth,onlineClass.requestAppointment);
    app.get('/online-class/student/appointment/list', auth,onlineClass.getStudentAppointmentRequestList);
    app.get('/online-class/tutor/appointment/list', auth,onlineClass.getTutorAppointmentRequestList);
    app.patch('/online-class/tutor/appointment/:id/status',auth, onlineClass.updateAppointmentStatus); 
    app.patch('/online-class/student/appointment/:id/delete',auth, onlineClass.deleteStudentAppointmentHistory); 
    app.patch('/online-class/tutor/appointment/:id/delete',auth, onlineClass.deleteTutorDeleteAppointmentHistory); 
    app.post('/online-class/student/appointment', auth,onlineClass.requestAppointment);

    app.post('/online-class/student/requesttutor', auth,onlineClass.createTutorRequest);

    // get zoom link 
    app.get('/online-class/student/getzoomlink/:id', auth,onlineClass.getZoomLink);

}