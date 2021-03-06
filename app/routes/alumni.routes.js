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
        } 
        else if (file.fieldname === "video"){
            cb(null, feedsConfig.videoUploadPath.trim());
        }
        else if(file.fieldname == "document"){
            cb(null, feedsConfig.documentUploadPath.trim());
        }
        
        else{
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
   app.get('/alumni/list',auth,  alumni.listAlumni1);
   app.get('/alumni/details/:id',auth,  alumni.details);
   app.post('/alumni/join-request', auth,  alumni.joinRequest);
   app.get('/alumni/list-join-request', auth,  alumni.listJoinRequests);
   app.get('/alumni/joinee-detail', auth,  alumni.joineeDetail);
   app.patch('/alumni/:id/accept-join-request',auth,alumni.acceptJoinRequests)

   app.post('/alumni/add-event', auth,upload.single('image'),  alumni.addAlumniEvents);
   app.patch('/alumni/edit-event/:id', auth,upload.single('image'),  alumni.editEvents);
   app.delete('/alumni/remove-event/:id', auth,upload.single('image'),  alumni.deleteEvents);
   app.post('/alumni/add-job', auth,upload.single('image'),  alumni.addAlumniJobs);

   app.get('/alumni/list-events',auth,alumni.listEvents);
   app.get('/alumni/list-jobs',auth,alumni.listJobs);

   app.get('/alumni/detail-events/:id',auth,alumni.detailsEvents);
   app.get('/alumni/detail-jobs/:id',auth,alumni.detailsJobs);

   app.post('/alumni/event-participate/:id',auth,alumni.eventParticipate);

   app.get('/alumni/list-memebers',auth,alumni.listMembers);

   app.get('/alumni/list-contest/:id',auth,alumni.listContest);
   app.get('/alumni/list-contest-permission/:id',auth,alumni.listContestForPermission);

   app.post('/alumni/contest-permission/',auth,alumni.contestPermission);
   app.post('/alumni/contest-participation/',auth,upload.single('image'),alumni.alumniContestParticipation);
   app.post('/alumni/contest-participation-video/',auth,upload.single('video'),alumni.alumniContestParticipation);
   app.post('/alumni/contest-participation-document/',auth,upload.single('document'),alumni.alumniContestParticipation);
   app.get('/alumni/contest-detail/:id',auth,alumni.detailOfContest);
   //app.get('/alumni/contest-detail-past/:id',auth,alumni.detailOfContestPast);

   app.patch('/alumni/set-admin/:id',auth,alumni.setAdmin);
   app.delete('/alumni/remove-admin/:id',auth,alumni.deleteAdmin);
   app.delete('/alumni/remove-all',auth,alumni.deleteAll);
  
  
}