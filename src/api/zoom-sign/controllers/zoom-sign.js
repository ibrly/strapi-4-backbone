'use strict';

/**
 * A set of functions called "actions" for `zoom-sign`
 */
const crypto = require('crypto') // crypto comes with Node.js

const ROLES = {attendee: 0, host: 1}

function generateSignature(apiKey,
                           apiSecret,
                           meetingNumber,
                           role) {
  // Prevent time sync issue between client signature generation and zoom
  const timestamp = new Date().getTime() - 30000
  const msg       = Buffer.from(apiKey + meetingNumber + timestamp + role)
                          .toString('base64')
  const hash      = crypto.createHmac('sha256',
                                      apiSecret)
                          .update(msg)
                          .digest('base64')
  const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`)
                          .toString('base64')

  return signature
}

module.exports = {
  zoomsign: async (ctx,
                   next) => {
    const {ZOOM_SDK_KEY, ZOOM_SDK_SECRET} = process.env
    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
      ctx.status = 500
      ctx.body   = {error: 'Zoom is not configured: set ZOOM_SDK_KEY and ZOOM_SDK_SECRET'}
      return
    }

    const {meetingNumber, role = ROLES.attendee} = ctx.request.body || {}
    if (!/^\d{9,11}$/.test(String(meetingNumber))) {
      ctx.status = 400
      ctx.body   = {error: 'meetingNumber must be a 9 to 11 digit Zoom meeting number'}
      return
    }
    if (role !== ROLES.attendee && role !== ROLES.host) {
      ctx.status = 400
      ctx.body   = {error: 'role must be 0 (attendee) or 1 (host)'}
      return
    }
    if (role === ROLES.host && !ctx.state.user) {
      ctx.status = 403
      ctx.body   = {error: 'only signed-in users can join as host'}
      return
    }

    ctx.body = {signature: generateSignature(ZOOM_SDK_KEY, ZOOM_SDK_SECRET, String(meetingNumber), role)}
  }
};
