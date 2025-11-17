# Cash Me - Backend API

Backend server for the Cash Me personal finance application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your API credentials to `.env`

4. Start the server:
```bash
npm run dev  # Development with auto-reload
npm start    # Production
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

## Environment Variables

See `.env.example` for required configuration.

## Tech Stack

- Express.js
- Plaid API
- OpenAI API
- MongoDB (future)
