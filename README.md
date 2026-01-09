# Chafo

Secure chat web application foundation with OTP-based login, contact approvals, and
self-destructing messages.

## Requirements

- Node.js 18+
- npm 9+
- MongoDB instance (local or hosted)

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and fill in values:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000`.

## Environment variables

The following server-side environment variables are required:

- `MONGODB_URI` - MongoDB connection string.
- `OTP_PROVIDER_KEY` - API key for the OTP provider.
- `OTP_PROVIDER_SECRET` - API secret for the OTP provider.
- `APP_SECRET` - Application secret used for signing or encryption.

See `.env.example` for a baseline template.

## Project structure

- `src/app` - Next.js App Router pages, layouts, and route handlers.
- `src/lib` - Shared utilities (database, env parsing, etc.).
- `src/models` - Domain model types.
- `src/services` - Service integrations (OTP, messaging, etc.).
- `src/api` - Reusable API client helpers.
