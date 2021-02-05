
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');

var usersConfig = config.users;
var tutorsConfig = config.tutors;

var storage = multer.diskStorage({
    // destination: usersConfig.imageUploadPath,
    destination: function (req, file, cb) {
        if (file.fieldname === "image"){
            cb(null, usersConfig.imageUploadPath.trim());
        } else if (file.fieldname === "video"){
            cb(null, tutorsConfig.videoUploadPath.trim());
        }else{
            return cb({success: 0, message: "Invalid types" });
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


// var videoStorage = multer.diskStorage({
//     destination: tutorsConfig.videoUploadPath,
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });


// var videoUpload = multer({ storage: videoStorage });

const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const accounts = require('../controllers/accounts.controller');
    app.post('/accounts', fileUpload.single('image'), accounts.create); 
    app.post('/accounts', accounts.create);
    app.post('/accounts/login-email', accounts.loginWithEmail);
    console.log("flag 8901");
    app.post('/accounts/otp', accounts.sendOtp_1);
    app.post('/accounts/otp/verify', accounts.verifyOtp);
    app.post('/accounts/recover', accounts.recover);
    app.post('/accounts/reset/:token',accounts.resetPassword);
    app.get('/accounts/self',auth, accounts.getUserDetails);
    app.patch('/accounts',auth,fileUpload.single('image'),  accounts.update);
    app.post('/accounts/update-profile-ios',auth,fileUpload.single('image1'),  accounts.updateIos);
    //app.patch('/accounts/addpassword',auth,  accounts.addPassword);
    // app.patch('/accounts',auth, fileUpload.single('image'), accounts.update);
    app.get('/accounts/get-karma',auth, accounts.getKarmaIndex);
    app.patch('/accounts/update-coin',auth, accounts.updateCoin);
    app.get('/accounts/check-week-most-like',auth, accounts.checkWeekMostLike);
    app.get('/accounts/counts',auth,accounts.getCoinCount);
    app.get('/accounts/myDonations',auth,accounts.getMyDonations);
    app.get('/accounts/myBookings',auth,accounts.getMyBookings);
    app.get('/accounts/mycoins-summary',auth,accounts.getMyCoinsSummary);

    app.post('/accounts/social-signup', accounts.socialSignup); 
    app.delete('/accounts/delete',auth, accounts.deleteAccount); 
    app.patch('/accounts/status', auth,accounts.updateAccountStatus); 

    //After social signup screen
    app.patch('/accounts/update1',accounts.updateForSocialAccount);
    app.patch('/accounts/update',fileUpload.single('image'),accounts.updateProfile);

    //Request as become tutor
    app.post('/accounts/request-as-tutor',auth,fileUpload.single('video'), accounts.requestAsTutor); 
    app.get('/accounts/tutor/profile',auth, accounts.getTutorProfile); 
    app.patch('/accounts/tutor/profile',auth,fileUpload.single('video'), accounts.updateTutorProfile); 
     // enquiry routes
    const enquiry = require('../controllers/enquiry.controller.js');
   
    app.post('/accounts/addmessage',auth, enquiry.add);

    //ratings 

    app.post('/accounts/add-rating-class/:id',auth,accounts.addratingToClass)
    app.post('/accounts/add-rating-tutor/:id',auth,accounts.addratingTutor)

    //innovation challenge
    app.post('/accounts/:id/add-innovation-challenge/',auth,accounts.addNewinnovation)

};
