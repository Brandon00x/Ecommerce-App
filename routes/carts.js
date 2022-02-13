const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

router.post('/cart/products', async (req, res) => {
    console.log(req.body.productId);

    //Check if cart exists for user cookie.
    let cart;
    if (!req.session.cartId) {
        //No Cart - Create Cart on req.session.cartId
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    } else {
        //Has Cart
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    const existingItem = cart.items.find(item => item.id === req.body.productId)
    if(existingItem) {
        //Increment QTY
        existingItem.quantity++;
    } else {
        //Add new product to items array
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }
    //Save Cart 
    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    res.redirect('/cart');
});

router.get('/cart', async (req, res) => {
    //Person has no CartID
    if (!req.session.cartId) {
        return res.redirect('/');
    }

    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        const product = await productsRepo.getOne(item.id);

        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }));
});

router.post('/cart/products/delete', async (req, res) => {
    const { itemId } = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    const items = cart.items.filter(item => item.id !== itemId);

    await cartsRepo.update(req.session.cartId, { items });

    res.redirect('/cart');
});

module.exports = router;