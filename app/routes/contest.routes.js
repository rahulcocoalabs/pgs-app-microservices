const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var contestConfig = config.contests;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.files.images && !req.files.video && !req.files.documents)
            cb(null, contestConfig.imageUploadPath);
        if (!req.files.images && req.files.video && !req.files.documents)
            cb(null, contestConfig.videoUploadPath);
        if (!req.files.images && !req.files.video && req.files.documents)
            cb(null, contestConfig.documentUploadPath);
        if (!(req.files.images && !req.files.video && !req.files.documents) && !(!req.files.images && req.files.video && !req.files.documents) && !(!req.files.images && !req.files.video && req.files.documents)) {
            return cb({success: 0, message: "You cannot post multiple types" });
        }
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err)
                return cb(err)
            cb(null, raw.toString('hex') + "." + mime.getExtension(file.mimetype))
        })
    }
});

var contestUpload = multer({ storage: storage });

module.exports = (app) => {
    const contests = require('../controllers/contests.controller');
    app.get('/contest', contests.listAll);
    app.get('/contest/:id/detail', auth,contests.detail);
    app.get('/contest/contest-history',auth, contests.listContestHistory);
    app.get('/contest/result-announced',auth, contests.listResultAnnouncedContest);
    app.get('/contest/:id/leader-board',auth, contests.getLeaderBoard);
    app.post('/contest/add-innovation',auth, contests.addContestInnovation);
    app.post('/contest',auth,contestUpload.fields([{ name: 'images', maxCount: contestConfig.maxImageCount }, { name: 'documents', maxCount: contestConfig.maxDocumentsCount }, { name: 'video', maxCount: contestConfig.maxVideoCount }]), contests.addContestItem);
}