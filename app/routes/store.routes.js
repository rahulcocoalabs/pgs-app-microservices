const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const store = require('../controllers/store.controller');

    app.get('/store/products',auth, store.products);
    app.get('/store/products/:id',auth, store.productDetails);
    app.get('/store/summary',auth, store.summary); 
    app.get('/store/summary/v2',auth, store.summaryForWeb);
    app.get('/store/banners',auth, store.banners);
    app.get('/store/categories',auth, store.categories);
    //store autocomplete


    app.get('/store/home',auth,store.getHome)
   
}

