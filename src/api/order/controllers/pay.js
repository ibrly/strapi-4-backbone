'use strict';

/**
 * A set of functions called "actions" for `pay`
 */
const Stripe = require("stripe");

module.exports = {
  payment: async (
    ctx,
    next
  ) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      ctx.status = 500;
      ctx.body   = {error: 'Payments are not configured: set STRIPE_SECRET_KEY'};
      return;
    }

    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await Stripe(secretKey).paymentIntents.create({
        amount  : 2000,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      ctx.body = {clientSecret: paymentIntent.client_secret};
    } catch (err) {
      strapi.log.error(`Stripe PaymentIntent failed: ${err.type || err.name}: ${err.message}`);
      ctx.status = 502;
      ctx.body   = {error: 'The payment provider could not create the payment, try again later'};
    }
  }
};
