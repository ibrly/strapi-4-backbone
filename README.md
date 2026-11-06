# strapi-4-backbone

A Strapi v4 backend backbone on MySQL with users and permissions, i18n, SendGrid email, Stripe payments, Zoom Web SDK signatures, a Socket.io server for live meetup updates, and generated API documentation.

## Content APIs

| API | Path | Purpose |
|-----|------|---------|
| Meetups | [src/api/meetup](src/api/meetup) | CRUD for meetups |
| Messages | [src/api/message](src/api/message) | chat messages (REST only) |
| Orders | [src/api/order](src/api/order) | orders and a Stripe payment action |
| Zoom sign | [src/api/zoom-sign](src/api/zoom-sign) | signs Zoom Web SDK join requests |

Extensions live in [src/extensions](src/extensions) (users-permissions, email, upload, documentation). [src/plugins/socket](src/plugins/socket) is still an empty plugin scaffold.

## Real-time updates

`bootstrap` in [src/index.js](src/index.js) starts a Socket.io server on the Strapi HTTP server. A client that emits `meetupsChanged` makes every other client receive `fresh`, so they can refetch meetups. Set `SOCKET_FRONT_ORIGIN` to the frontend's origin; without it browsers block the connection.

## Getting started

Requires Node 14 or 16 and a MySQL instance.

```bash
cp .env.example .env    # fill in secrets, database and integration keys
npm install
npm run develop         # admin panel at http://localhost:1337/admin
```

Production:

```bash
npm run build
npm start               # or: pm2 start ecosystem.config.js
```

## Zoom sign

`POST /api/zoomsign` with `{"meetingNumber": 123456789, "role": 0}` returns `{"signature": "..."}` for the Zoom Web SDK.

- `meetingNumber`: the 9 to 11 digit meeting number, as a number or a string
- `role`: `0` attendee (the default) or `1` host. Host needs a signed-in user (send the JWT), otherwise the endpoint answers 403.
- Bad input gets a 400. Missing `ZOOM_SDK_KEY` / `ZOOM_SDK_SECRET` gets a 500.

## Tests

```bash
npm test   # Node 18+, runs without a database
```

## Environment variables

See [.env.example](.env.example). Stripe (`STRIPE_SECRET_KEY`), Zoom (`ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`) and SendGrid (`SENDGRID_API_KEY`) keys are read from the environment and must never be committed.
