const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const contests = require('../controllers/shopProducts.controller');
    app.get('/shop-products/list', auth,contests.listShopProducts);
    app.get('/shop-products/:id/detail',auth, contests.shopProductDetail);
    app.post('/shop-products/:id/redeem',auth, contests.redeemShopProduct);
}