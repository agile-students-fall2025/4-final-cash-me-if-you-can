# Cash Me - Demo Instructions

## Setup

### 1. Install Dependencies

**Backend:**
```bash
cd back-end
npm install
```

**Frontend:**
```bash
cd front-end
npm install
```

### 2. Configure Environment (Optional)

The app works out-of-the-box with mock data. To add real API integration:

**Backend (.env):**
```bash
cd back-end
cp .env.example .env
# Edit .env and add your API keys:
# - PLAID_CLIENT_ID
# - PLAID_SECRET
# - OPENAI_API_KEY
```

**Frontend (.env):**
```bash
cd front-end
cp .env.example .env
# Default backend URL is http://localhost:5000/api
```

## Running the Demo

### 1. Start Backend Server

```bash
cd back-end
npm run dev
```

Server will start on http://localhost:5000

You should see:
```
🚀 Server running on port 5000
📍 Health check: http://localhost:5000/api/health
```

### 2. Start Frontend

In a new terminal:

```bash
cd front-end
npm start
```

React app will start on http://localhost:3000

## Testing Features

### Dashboard (Home Page)
- View spending graph over different time periods (week/month/quarter/year)
- See account balances
- All data comes from backend API

### Transactions
- View all transactions with auto-categorization
- Click a transaction to manually assign/change category
- Categories are saved via backend API

### Chatbot
- Ask financial questions: "How much did I spend on groceries?"
- Get budgeting advice: "How should I save money?"
- Query your data: "Show my recent transactions"
- Chatbot uses RAG + function calling (fallback mode works without OpenAI API key)

## API Endpoints Available

- `GET /api/health` - Health check
- `POST /api/plaid/create_link_token` - Create Plaid Link token
- `POST /api/plaid/transactions` - Get transactions
- `POST /api/plaid/accounts` - Get accounts
- `GET /api/transactions` - Get categorized transactions
- `PUT /api/transactions/:id/category` - Update transaction category
- `GET /api/transactions/by-category` - Get spending by category
- `POST /api/chat/message` - Send message to chatbot
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/spending/:period` - Get spending by period
- `GET /api/dashboard/categories` - Get category breakdown

## Troubleshooting

**CORS errors:** Make sure backend is running on port 5000

**No data showing:** Check browser console for errors, ensure backend is running

**Chatbot not responding:** Check that backend `/api/chat/message` endpoint is accessible

## Mock Data

Without API keys, the app uses mock data:
- 20 sample transactions across various categories
- 3 accounts (checking, savings, credit card)
- 20+ financial tips in knowledge base
- Auto-categorization works based on merchant names

## Adding Real API Keys

1. Get Plaid sandbox credentials from https://plaid.com
2. Get OpenAI API key from https://platform.openai.com
3. Add them to `back-end/.env`
4. Restart backend server
5. App will automatically use real APIs
