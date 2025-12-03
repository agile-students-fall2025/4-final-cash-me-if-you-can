# Mock Data

## Why Mock Data?

We designed Clarity AI to integrate with **Plaid** for real financial data (bank accounts, transactions, balances). However, Plaid requires enterprise-level approval and has strict card rails that prevent individual developers from accessing their production API.

To demonstrate our app's full capabilities, we created mock data that mirrors Plaid's actual data structure. This data was modeled after Plaid's API documentation and test sources.

## How It Works

1. Mock data files (`mockAccounts.json`, `mockTransactions.json`) follow Plaid's schema
2. The `seedDatabase.js` script loads this data into MongoDB
3. All app features (Dashboard, Chatbot, Net Worth, etc.) fetch from MongoDB - not directly from these JSON files

## Key Point

**Mock data is not a replacement for our database architecture.** Everything in the app connects to MongoDB. The mock data simply populates the database to simulate what real Plaid integration would provide.

When Plaid access is available, we would replace the seed script with actual Plaid API calls - the rest of the app requires no changes.
