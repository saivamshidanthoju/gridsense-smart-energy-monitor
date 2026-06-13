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

## Protected APIs

- `GET /api/readings/latest`
- `GET /api/readings/history`
- `GET /api/billing`
- `GET /api/alerts`

All protected routes read the JWT token and return data only for the authenticated user's `meterId`.

## Local development

1. Copy `.env.example` to `.env`.
2. Add your MongoDB Atlas connection string and JWT secret.
3. Run `npm run dev`.

If `MONGODB_URI` is missing, the backend still runs in mock persistence mode so the frontend can be exercised safely during development.
