'use strict';

// Runs the pay controller with a fake Koa ctx and a stubbed stripe module: no Strapi, database or network.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

let createIntent;
const stripeCalls = [];
const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'stripe') {
    return key => {
      stripeCalls.push(key);
      return {paymentIntents: {create: params => createIntent(params)}};
    };
  }
  return originalLoad.call(this, request, ...rest);
};
const {payment, jwt} = require('../src/api/order/controllers/pay');
Module._load = originalLoad;

const logged = [];
global.strapi = {log: {error: message => logged.push(message)}};

const call = async () => {
  const ctx = {request: {body: {items: [{id: 'xl-tshirt'}]}}, status: 200, body: undefined};
  await payment(ctx, () => {});
  return ctx;
};

test.beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  stripeCalls.length = 0;
  logged.length = 0;
});

test('returns the client secret of a 20 EUR PaymentIntent', async () => {
  let seen;
  createIntent = async params => {
    seen = params;
    return {client_secret: 'pi_123_secret_456'};
  };
  const ctx = await call();
  assert.equal(ctx.status, 200);
  assert.deepEqual(ctx.body, {clientSecret: 'pi_123_secret_456'});
  assert.deepEqual(seen, {amount: 2000, currency: 'eur', automatic_payment_methods: {enabled: true}});
  assert.deepEqual(stripeCalls, ['sk_test_fake']);
});

test('answers 502 and logs when Stripe fails', async () => {
  createIntent = async () => {
    const err = new Error('Invalid API Key provided: sk_test_****fake');
    err.type = 'StripeAuthenticationError';
    throw err;
  };
  const ctx = await call();
  assert.equal(ctx.status, 502);
  assert.match(ctx.body.error, /payment provider/);
  assert.equal(JSON.stringify(ctx.body).includes('Invalid API Key'), false);
  assert.equal(logged.length, 1);
  assert.match(logged[0], /StripeAuthenticationError/);
});

test('answers 500 without calling Stripe when the key is missing', async () => {
  delete process.env.STRIPE_SECRET_KEY;
  createIntent = async () => assert.fail('Stripe must not be called');
  const ctx = await call();
  assert.equal(ctx.status, 500);
  assert.match(ctx.body.error, /STRIPE_SECRET_KEY/);
  assert.equal(stripeCalls.length, 0);
});

test('the debug jwt action is gone', () => {
  assert.equal(jwt, undefined);
});
