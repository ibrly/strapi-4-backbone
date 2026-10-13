'use strict';

// Runs the controller with a fake Koa ctx: no Strapi instance or database needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const {zoomsign} = require('../src/api/zoom-sign/controllers/zoom-sign');

const call = async (body, user) => {
  const ctx = {request: {body}, state: {user}, status: 200, body: undefined};
  await zoomsign(ctx, () => {});
  return ctx;
};

test.beforeEach(() => {
  process.env.ZOOM_SDK_KEY = 'test-key';
  process.env.ZOOM_SDK_SECRET = 'test-secret';
});

test('signs the requested meeting as an attendee by default', async () => {
  const ctx = await call({meetingNumber: 123456789});
  assert.equal(ctx.status, 200);

  const [key, meeting, timestamp, role, hash] = Buffer.from(ctx.body.signature, 'base64').toString().split('.');
  assert.deepEqual([key, meeting, role], ['test-key', '123456789', '0']);
  const msg = Buffer.from(key + meeting + timestamp + role).toString('base64');
  assert.equal(hash, crypto.createHmac('sha256', 'test-secret').update(msg).digest('base64'));
  assert.ok(Math.abs(Date.now() - 30000 - Number(timestamp)) < 1000);
});

test('accepts the meeting number as a string', async () => {
  const ctx = await call({meetingNumber: '94569876993', role: 0});
  assert.equal(ctx.status, 200);
  assert.equal(Buffer.from(ctx.body.signature, 'base64').toString().split('.')[1], '94569876993');
});

test('rejects bad meeting numbers and roles with a 400', async () => {
  for (const body of [{}, undefined, {meetingNumber: 'abc'}, {meetingNumber: 123}, {meetingNumber: '1234567890123'}]) {
    assert.equal((await call(body)).status, 400, JSON.stringify(body));
  }
  for (const role of [2, -1, '1', 'host']) {
    assert.equal((await call({meetingNumber: 123456789, role})).status, 400, String(role));
  }
});

test('host signatures need a signed-in user', async () => {
  assert.equal((await call({meetingNumber: 123456789, role: 1})).status, 403);

  const ctx = await call({meetingNumber: 123456789, role: 1}, {id: 1});
  assert.equal(ctx.status, 200);
  assert.equal(Buffer.from(ctx.body.signature, 'base64').toString().split('.')[3], '1');
});

test('answers 500 instead of signing with missing credentials', async () => {
  delete process.env.ZOOM_SDK_SECRET;
  const ctx = await call({meetingNumber: 123456789});
  assert.equal(ctx.status, 500);
  assert.match(ctx.body.error, /ZOOM_SDK_SECRET/);
});
