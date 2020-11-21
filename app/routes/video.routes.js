const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const videos = require('../controllers/videos.controller');

    app.get('/videos',auth, videos.listAllVideos);
    app.get('/videos/detail/:id',auth, videos.getVideoDetail); 
    app.get('/videos/summary',auth, videos.getSummary);
    app.get('/videos/summary/v2',auth, videos.getSummaryForWeb);
    
    app.get('/videos/categories',auth, videos.listAllCategories);
    app.get('/videos/categories/:id',auth, videos.getVideoCategoryDetail);
   
}