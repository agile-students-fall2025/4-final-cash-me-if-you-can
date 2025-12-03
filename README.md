# Cash Me If You Can

## Product Vision Statement

A simple and intuitive financial management platform that helps users understand their spending habits, categorize transactions, and receive personalized financial guidance through an AI-powered assistant.

## Team Members

- [Namay Jindal](https://github.com/namayjindal) - GitHub: @namayjindal
- [George Ai](https://github.com/GeorgeAi43) - GitHub: @GeorgeAi43
- [Sanay Daptardar](https://github.com/sanay-d-nyu) - GitHub: @sanay-d-nyu 
- [Shaurya Jain](https://github.com/shauryajain21) - GitHub: @shauryajain21 

## Project Description

Cash Me If You Can is a personal finance app where users can connect their bank accounts, categorize transactions, view spending graphs, and chat with an AI financial assistant for personalized advice. The app aims to make financial management accessible and easy for everyone.

## Project History

This project was created as part of an Agile Software Development course. Our team identified the need for a more user-friendly financial tracking tool that combines transaction management with AI-powered insights.

## Features

- User login and signup
- Connect bank accounts via Plaid API
- Automatic transaction import
- Manual and automatic transaction categorization
- Interactive spending dashboard with graphs
- Time-based spending analysis (week/month/quarter/year)
- AI chatbot for financial advice using RAG
- Account balance tracking

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our team norms, git workflow, and the process for contributing to this project.

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd 4-final-cash-me-if-you-can
```

2. Install dependencies for the front-end
```bash
cd front-end
npm install
```

3. Start the development server
```bash
npm start
```

The app should open in your browser at `http://localhost:3000`

## Building and Testing

### Run the development server
```bash
cd front-end
npm start
```

### An Account with mock data for demo
```bash
cd back-end
npm run seed
```
Email: emily.chen@nyu.edu
Password: demo123

### Build for production
```bash
cd front-end
npm run build
```

### Run tests
```bash
cd front-end
npm test
```

## Usage

- Navigate through different pages using the hamburger menu
- Click on transactions to categorize them
- View your spending patterns on the dashboard
- Chat with the financial assistant for advice
- Connect additional bank accounts

## Built With

- **Front-End**: React.js, React Router, Recharts
- **Back-End**: (Coming in Sprint 2)
- **Database**: (Coming in Sprint 3)
- **APIs**: Plaid API for bank connections, RAG for AI chatbot

## Project Structure

```
front-end/
  src/
    components/     # React components
    data/          # Mock JSON data files
    *.css          # Styling files
```

## Additional Documentation

- [UX Design](./UX-DESIGN.md)
- [Sprint Planning](./instructions-0d-sprint-planning.md)

## License

See [LICENSE.md](./LICENSE.md) for details.
