# strapi-4-backbone

A Strapi v4 backend backbone on MySQL with users and permissions, i18n, SendGrid email, Stripe payments, Zoom Web SDK signatures, a custom Socket.io plugin for real-time chat, and generated API documentation.

## Content APIs

| API | Path | Purpose |
|-----|------|---------|
| Meetups | [src/api/meetup](src/api/meetup) | CRUD for meetups |
| Messages | [src/api/message](src/api/message) | chat messages, pushed live through the socket plugin |
| Orders | [src/api/order](src/api/order) | orders and a Stripe payment action |
| Zoom sign | [src/api/zoom-sign](src/api/zoom-sign) | signs Zoom Web SDK join requests |

Plugins and extensions live in [src/plugins/socket](src/plugins/socket) and [src/extensions](src/extensions) (users-permissions, email, upload, documentation).

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

## Environment variables

See [.env.example](.env.example). Stripe (`STRIPE_SECRET_KEY`), Zoom (`ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`) and SendGrid (`SENDGRID_API_KEY`) keys are read from the environment and must never be committed.
