function CartController(methods, options) {
  var config = require('../../config/app.config.js');
  var storeConfig = config.storeProducts;
  this.addTocart = function (req, res) {
    var Cart = methods.loadModel('cart');
    var Product = methods.loadModel('product');
    var Stockstaus = methods.loadModel('stockStatus');
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;
    var cartQuantity;
    var stock_status_id;
    var userData = req.identity.data;
    var userId = userData.userId;
    var customerId = userId;
    if (!product_id || !quantity) {
      errors = [];
      if (!product_id) {
        errors.push({
          field: "product_id",
          message: "Product_id cannot be empty"
        });
      }
      if (!quantity) {
        errors.push({
          field: "quantity",
          message: "Quantity cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    Product.findAll({
      where: {
        product_id: product_id
      }
    }).then(result => {
      if (result.length == 0) {
        res.send({
          success: 0,
          message: "Invalid product Id"
        })
      } else {
        stock_status_id = result[0].dataValues.stock_status_id;
        Stockstaus.findAll({
          where: {
            stock_status_id: stock_status_id
          }
        }).then(result => {
          if (result[0].dataValues.name == 'In Stock') {
            Cart.findAll({
              where: {
                productId: product_id,
                customer_id: customerId,
                status: 1
              }
            }).then(result => {
              if (result.length == 0) {
                Cart.create({
                  productId: product_id,
                  quantity: quantity,
                  customer_id: customerId,
                  status: 1,
                  date_added: Date.now()
                }).then(result => {
                  res.send({
                    success: 1,
                    message: "Successfully added to cart"
                  })
                }).catch(err => {
                  res.send({
                    success: 0,
                    message: err.message || "Some error occurred while adding to cart."
                  })
                })

              } else {
                cartQuantity = result[0].dataValues.quantity;
                Cart.update({
                  quantity: parseInt(cartQuantity) + parseInt(quantity)
                }, {
                  where: {
                    productId: product_id,
                    customer_id: customerId,
                    status: 1
                  }
                }).then(result => {
                  res.send({
                    success: 1,
                    message: "Successfully added to cart"
                  })
                })
              }
            })
          } else {
            res.send({
              success: 0,
              message: "Selected product is out of stock"
            })
          }
        })
      }
    })
  };

  this.removeFromCart = function (req, res) {
    var Cart = methods.loadModel('cart');
    var cart_id = req.body.cart_id;
    var i;
    var count = 0;
    if (!cart_id) {
      return res.send({
        success: 0,
        message: "Cart_id Id should not be  empty"
      })
    };
    for (i = 0; i < cart_id.length; i++) {
      count = count + 1;
      Cart.update({
        status: 0
      }, {
        where: {
          cart_id: cart_id
        }
      })
      if (count == cart_id.length) {
        var retrunData = {
          success: 1,
          message: "Successfully deleted the products from cart"
        };
        res.send(retrunData);
      }
    };

  }

  this.updateCart = function (req, res) {
    var Cart = methods.loadModel('cart');
    var userData = req.identity.data;
    var userId = userData.userId;
    var cart_id = req.body.cart_id;
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;
    if (!cart_id || !quantity) {
      errors = [];
      if (!cart_id) {
        errors.push({
          field: "cart_id",
          message: "Cart_id cannot be empty"
        });
      }
      if (!quantity) {
        errors.push({
          field: "quantity",
          message: "Quantity cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    Cart.update({
      quantity: quantity,
      productId: product_id
    }, {
      where: {
        cart_id: cart_id,
        customer_id: userId
      }
    }).then(() => {
      var retrunData = {
        success: 1,
        message: "Successfully updated the cart"
      }
      res.send(retrunData)
    }).catch(err => {
      res.send({
        success: 0,
        message: err.message || "Some error occured while updating cart"
      })
    })

  }

  this.createOrder = async function (req, res) {
    var Cart = methods.loadModel('cart');
    var Order = methods.loadModel('order');
    var OrderProduct = methods.loadModel('orderProduct');
    var userData = req.identity.data;
    var userId = userData.userId;
    var params = req.body;
    var address_id = params.address_id;
    var cart_ids = params.cart;
    var i;
    var j;
    var counter = 0;
    var cart_id;
    var order_id;
    var product_id;
    if (!cart_ids || !address_id) {
      errors = [];
      if (!cart_ids) {
        errors.push({
          field: "cart_id",
          message: "Cart cannot be empty"
        });
      }
      if (!address_id) {
        errors.push({
          field: "address_id",
          message: "Address_id cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
        code: 200
      });
    }

    try {
      let createOrder = await Order.create({
        shipping_address_id: address_id,
        customer_id: userId
      });
      order_id = createOrder.dataValues.order_id;
      for (i = 0; i < cart_ids.length; i++) {
        counter = counter + 1;
        cart_id = cart_ids[i];
        let result = await Cart.findAll({
          where: {
            cart_id: cart_id
          }
        });
        for (j = 0; j < result.length; j++) {
          product_id = result[j].dataValues.productId;
          let createOrderProduct = await OrderProduct.create({
            order_id: order_id,
            product_id: product_id,
            address_id: address_id
          });
        };
        if (counter == cart_ids.length) {
          res.send({
            success: 1,
            message: "Order created successfully"
          })
        };
      }
    } catch (err) {
      console.error(err);
    }
  };

  this.myOrder = async (req, res) => {
    var Order = methods.loadModel('order');
    var OrderProduct = methods.loadModel('orderProduct');
    var Product = methods.loadModel('product');
    var userData = req.identity.data;
    var userId = userData.userId;
    var order_id;
    var i;
    var j;
    var counter = 0;
    var orderProductId;
    var orderQuantity;
    var productDetails;
    var items = [];
    try {
      let myOrders = await Order.findAll({
        where: {
          customer_id: userId
        }
      });
      if(myOrders.length == 0) {
        return res.send({
          success: 0,
          message: 'No orders found'
        })
      };
      for (i = 0; i < myOrders.length; i++) {
        counter = counter + 1;
        order_id = myOrders[i].dataValues.order_id;
        let OrderedPdt = await OrderProduct.findAll({
          where: {
            order_id: order_id
          }
        });
        for (j = 0; j < OrderedPdt.length; j++) {
          orderProductId = OrderedPdt[j].dataValues.product_id;
          orderQuantity = OrderedPdt[j].dataValues.quantity;
          productDetails = await Product.findOne({
            where: {
              product_id: orderProductId
            }
          });
          var data = {
            productId: productDetails.dataValues.product_id,
            productName: productDetails.dataValues.model,
            quantity: orderQuantity,
            price: productDetails.dataValues.price,
            image: productDetails.dataValues.image
          };
          items.push(data);
        }

        if (counter == myOrders.length) {
          res.send({
            success: 1,
            message: 'My orders listed successfully',
            imageBase: storeConfig.imageBase,
            items: items
          })
        }
      }
    } catch (err) {
      console.error(err);
    }

  }

  this.cancelOrder = function (req, res) {
    var OrderProduct = methods.loadModel('orderProduct');
    var OrderStatus = methods.loadModel('orderStatus');
    var order_product_id = req.body.order_product_id;
    var order_status_id;
    if (!order_product_id) {
      res.send({
        success: 0,
        message: "Order_product_id Id should not be  empty"
      })
    }
    OrderStatus.findAll({
      where: {
        name: 'Cancelled'
      }
    }).then(result => {
      order_status_id = result[0].dataValues.order_status_id;
      OrderProduct.update({
        order_status_id: parseInt(order_status_id)
      }, {
        where: {
          order_product_id: order_product_id
        }
      }).then(() => {
        res.send({
          status: 0,
          message: "Order Cancelled successfully"
        })
      }).catch(err => {
        res.send({
          success: 0,
          message: err.message || "Some error occured while cancelling order"
        })
      })
    })

  }

  this.getCartList = function (req, res) {
    var Cart = methods.loadModel('cart');
    var Product = methods.loadModel('product');
    var userData = req.identity.data;
    var userId = userData.userId;
    var customer_id = userId;
    var cart_id = req.body.cart_id;
    var product_id;
    if (cart_id) {
      Cart.findAll({
        where: {
          cart_id: cart_id,
          status: 1
        }
      }).then(results => {
        product_id = results[0].dataValues.productId;
        Product.findAll({
          where: {
            productId: product_id,
            status: 1
          }
        }).then(result => {
          model = result[0].dataValues.model;
          res.send({
            success: 1,
            cartitems: results,
          })
        })
      })
    } else {
      Cart.findAll({
        attributes: ['cart_id', 'quantity', 'type'],
        where: {
          customer_id: customer_id,
          status: 1
        },
        include: [{
          model: Product,
          attributes: ['product_id', 'model', 'image', 'price']
        }]
      }).then(result => {
        res.send({
          success: 1,
          imageBase: storeConfig.imageBase,
          message: 'Cart items listed successfully',
          cartitems: result
        })
      })
    }

  }

  this.trackOrder = function (req, res) {
    console.log('in track')
    var OrderProduct = methods.loadModel('orderProduct');
    var Address = methods.loadModel('address');
    var orderProductId = req.body.order_product_id;
    var orderId;
    var quantity;
    var productId;
    var address_id;
    var firstname;
    var lastname;
    var company;
    var address_1;
    var address_2;
    var city;
    var postcode;
    var mobile;
    console.log(orderProductId)
    if (!orderProductId) {
      return res.send({
        success: 0,
        message: "Order_product_id Id should not be  empty"
      })
    }
    OrderProduct.findAll({
      where: {
        order_product_id: orderProductId
      }
    }).then(result => {
      console.log(result)
      address_id = result[0].dataValues.address_id;
      orderId = result[0].dataValues.order_id;
      quantity = result[0].dataValues.quantity;
      productId = result[0].dataValues.productId;
      name = result[0].dataValues.name;
      Address.findAll({
        where: {
          address_id: address_id
        }
      }).then(result => {
        firstname = result[0].dataValues.firstname;
        lastname = result[0].dataValues.lastname;
        company = result[0].dataValues.company;
        address_1 = result[0].dataValues.address_1;
        address_2 = result[0].dataValues.address_2;
        city = result[0].dataValues.city;
        postcode = result[0].dataValues.postcode;
        mobile = result[0].dataValues.mobile;
      })
      res.send({
        success: 1,
        order_id: orderId,
        quantity: quantity,
        product_id: productId,
        firstname: firstname,
        lastname: lastname,
        company: company,
        address_1: address_1,
        address_2: address_2,
        city: city,
        postcode: postcode,
        mobile: mobile,
      })
    })
  }

  this.buynow = function (req, res) {
    var Cart = methods.loadModel('cart');
    var Product = methods.loadModel('product');
    var Stockstaus = methods.loadModel('stockStatus');
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;
    var userData = req.identity.data;
    var userId = userData.userId;
    var cart_id;
    if (!product_id || !quantity) {
      errors = [];
      if (!product_id) {
        errors.push({
          field: "product_id",
          message: "Product_id cannot be empty"
        });
      }
      if (!quantity) {
        errors.push({
          field: "quantity",
          message: "Quantity cannot be empty"
        });
      }
      return res.send({
        success: 0,
        errors: errors,
        code: 200
      });
    }
    Cart.findAll({
      where: {
        productId: product_id,
        customer_id: userId
      }
    }).then(result => {
      if (result.length > 0) {
        return res.send({
          success: 0,
          message: 'Product already in cart'
        })
      };
      Product.findAll({
        where: {
          product_id: product_id
        }
      }).then(result => {
        if (result.length == 0) {
          return res.send({
            success: 0,
            message: "Invalid product Id"
          })
        };
        stock_status_id = result[0].dataValues.stock_status_id;
        Stockstaus.findAll({
          where: {
            stock_status_id: stock_status_id
          }
        }).then(result => {
          if (result[0].dataValues.name == 'In Stock') {
            Cart.create({
              productId: product_id,
              quantity: quantity,
              customer_id: userId,
              status: 1,
              type: 'Buy now'

            }).then(result => {
              cart_id = result.dataValues.cart_id;
              res.send({
                success: 1,
                message: 'Successfully added to cart',
                cart_id: cart_id
              })
            })
          } else {
            res.send({
              success: 0,
              message: 'Selected product is out of stock'
            })
          }
        })
      })
    })
  }
}



module.exports = CartController;
