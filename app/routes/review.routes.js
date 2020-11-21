const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const reviews = require('../controllers/reviews.controller');

    app.get('/reviews',auth, reviews.getReviews);
    app.get('/reviews/self',auth, reviews.getUserReviews);
    app.post('/reviews',auth, reviews.postReview);
    app.patch('/reviews/:id',auth, reviews.updateReview);
    app.delete('/reviews/:id',auth, reviews.deleteReview);   
}
