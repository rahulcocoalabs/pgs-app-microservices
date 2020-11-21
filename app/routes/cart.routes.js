module.exports = (app,methods,options) => {
    console.log(methods,'methods')
    const cart = methods.loadController('cart',options); 
    
    cart.methods.get('/list',cart.getCartList,{auth:true});
    cart.methods.post('/add',cart.addTocart,{auth:true});
    cart.methods.delete('/remove',cart.removeFromCart,{auth:true});
    cart.methods.patch('/update',cart.updateCart,{auth:true});
    cart.methods.post('/buynow',cart.buynow,{auth:true});
    cart.methods.post('/create-order',cart.createOrder,{auth:true});
    cart.methods.get('/myOrders',cart.myOrder,{auth:true});
    cart.methods.patch('/cancel-order',cart.cancelOrder,{auth:true});
    cart.methods.get('/track-order/:id',cart.trackOrder,{auth:true});
}

