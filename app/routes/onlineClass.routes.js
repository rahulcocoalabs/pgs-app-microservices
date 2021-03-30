const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');

var classConfig = config.class;

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
    const onlineClass = require('../controllers/onlineClass.controller');
    app.post('/online-class/add', fileUpload.fields([{
        name: 'video', maxCount: 1
    }, {
        name: 'image', maxCount: 1
    }]), auth, onlineClass.createOnlineClass);
    app.get('/online-class/:id/detail', auth, onlineClass.getClassDetails);
    app.get('/online-class/list', auth, onlineClass.listOnlineClasses);
    app.get('/online-class/tutor/list', auth, onlineClass.listTutorList);
    app.get('/online-class/tutor/list-classes', auth, onlineClass.listClassForTutor);
    app.get('/online-class/tutor/list-requests', auth, onlineClass.listApointmentsForTutor);
    app.get('/online-class/student/home', auth, onlineClass.getStudentHome);
    app.get('/online-class/tutor/:id/detail', auth, onlineClass.getTutorDetails);
    app.post('/online-class/student/appointment', auth, onlineClass.requestAppointment);
    app.get('/online-class/student/appointment/list', auth, onlineClass.getStudentAppointmentRequestList);
    app.get('/online-class/tutor/appointment/list', auth, onlineClass.getTutorAppointmentRequestList);
    app.patch('/online-class/tutor/appointment/:id/status', auth, onlineClass.updateAppointmentStatus);
    app.patch('/online-class/student/appointment/:id/delete', auth, onlineClass.deleteStudentAppointmentHistory);
    app.patch('/online-class/tutor/appointment/:id/delete', auth, onlineClass.deleteTutorDeleteAppointmentHistory);
   // app.post('/online-class/student/appointment', auth, onlineClass.requestAppointment);

    app.post('/online-class/student/requesttutor', auth, onlineClass.createTutorRequest);

    app.post('/online-class/remove-all', auth, onlineClass.removeAll);

    // get join zoom link 
    app.get('/online-class/student/getzoomlink/:id', auth, onlineClass.getZoomLink);

    // get start zoom link 
    app.get('/online-class/tutor/start-zoom-link/:id', auth, onlineClass.getZoomStartLink);


    app.post('/online-class/add-institution', fileUpload.fields([{
        name: 'image', maxCount: 1
    }]), auth, onlineClass.createInstitution);

    app.get('/online-class/list-institutes', auth, onlineClass.listInstitutesAtHome);

    app.get('/online-class/detail-institute/:id', auth, onlineClass.detailInstitution);

    app.post('/online-class/add-institution-class', fileUpload.fields([{
        name: 'video', maxCount: 1
    }, {
        name: 'image', maxCount: 1
    }]), auth, onlineClass.addClass);

    app.post('/online-class/add-institution-favourite/:id', auth, onlineClass.addFavouriteInstitution);
    app.delete('/online-class/remove-institution-favourite/:id', auth, onlineClass.removeFavouriteInstitution);

    app.post('/online-class/add-institution-class-appointment', auth, onlineClass.addInstitutionClassAppointment);
    app.delete('/online-class/reject-institution-class-appointment/:id', auth, onlineClass.rejectInstitutionClassAppointment);
    app.patch('/online-class/accept-institution-class-appointment/:id', auth, onlineClass.acceptInstitutionClassAppointment);
    app.get('/online-class/list-institution-class-appointment/:id', auth, onlineClass.listInstitutionClassAppointment);

    app.get('/online-class/:id/detail-institute-class', auth, onlineClass.getInstituteClassDetails);
    app.delete('/online-class/remove-all',onlineClass.removeAll);
    app.post('/online-class/add-institution-class-favourite/:id', auth, onlineClass.addInstitutionClassFavourite);
    app.post('/online-class/remove-institution-class-favourite/:id', auth, onlineClass.removeInstitutionClassFavourite);
}