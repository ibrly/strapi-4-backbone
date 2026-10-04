'use strict';

/**
 * A set of functions called "actions" for `pay`
 */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
module.exports = {
  payment: async (
    ctx,
    next
  ) => {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    try {
      ctx.body = {clientSecret: paymentIntent.client_secret}
    } catch (err) {
      ctx.body = err;
    }
  }, jwt: async (
    ctx,
    next
  ) => {
    console.log(await strapi.plugins['users-permissions'].services.jwt.getToken(ctx))
    try {
      ctx.body = {}
    } catch (err) {
      ctx.body = err;
    }
  }
};
