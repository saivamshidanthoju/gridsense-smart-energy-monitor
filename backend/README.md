# Smart Energy Backend

This Express server is prepared for the smart electricity meter flow:

ESP32 + sensors -> MQTT or HTTP -> Node.js + Express -> MongoDB Atlas -> React dashboard

## MongoDB collections

- `users`
- `meters`
- `readings`
- `alerts`
- `bills`

## Authentication flow

1. `POST /api/auth/register`
   Stores `name`, `email`, `passwordHash`, `meterId`, `role`, and `createdAt`.
2. `POST /api/auth/login`
   Verifies the password with bcrypt and returns a JWT token.
3. `GET /api/auth/me`
   Uses the JWT token to return the authenticated user profile.

## Live reading APIs

- `GET /api/readings/latest`
- `GET /api/readings/history`

These routes read directly from the MongoDB Atlas `readings` collection and can be called by the React dashboard polling loop.

## Protected APIs

- `GET /api/billing`
- `GET /api/alerts`

Protected billing and alert routes accept an optional `meterId` query parameter, then fall back to
the authenticated user's meter and finally the latest live ESP32 meter reading.

## Local development

1. Copy `.env.example` to `.env`.
2. Add your MongoDB Atlas connection string and JWT secret.
3. Run `npm run dev`.

`MONGODB_URI` is required because live ESP32 readings are stored in MongoDB Atlas.
