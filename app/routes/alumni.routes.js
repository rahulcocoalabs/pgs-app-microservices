var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.alumni;
var feedsConfigEvents = config.alumniEvents;

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
   app.get('/alumni/details/:id',auth,  alumni.details);
   app.post('/alumni/join-request', auth,  alumni.joinRequest);
   app.get('/alumni/list-join-request', auth,  alumni.listJoinRequests);
   app.get('/alumni/joinee-detail', auth,  alumni.joineeDetail);
   app.patch('/alumni/:id/accept-join-request',auth,alumni.acceptJoinRequests)

   app.post('/alumni/add-event', auth,upload.single('image'),  alumni.addAlumniEvents);
   app.post('/alumni/add-job', auth,upload.single('image'),  alumni.addAlumniJobs);

   app.get('/alumni/list-events',auth,alumni.listEvents);
   app.get('/alumni/list-jobs',auth,alumni.listJobs);

   app.get('/alumni/detail-events/:id',auth,alumni.detailsEvents);
   app.get('/alumni/detail-jobs/:id',auth,alumni.detailsJobs);

   app.post('/alumni/event-participate/:id',auth,alumni.eventParticipate);

   app.get('/alumni/list-memebers',auth,alumni.listMembers);

   app.patch('/alumni/set-admin/:id',auth,alumni.setAdmin);
   app.delete('/alumni/remove-admin/:id',auth,alumni.deleteAdmin);
  
}