import React, { useState } from 'react';
import './TransactionCategories.css';

const MOCK_TRANSACTIONS = [
  { id: 1, date: '2025-10-26', description: 'Whole Foods Market', amount: -87.43, category: null },
  { id: 2, date: '2025-10-25', description: 'Uber Ride', amount: -23.50, category: null },
  { id: 3, date: '2025-10-25', description: 'Netflix Subscription', amount: -15.99, category: null },
  { id: 4, date: '2025-10-24', description: 'Salary Deposit', amount: 3500.00, category: null },
  { id: 5, date: '2025-10-23', description: 'Starbucks', amount: -5.75, category: null },
  { id: 6, date: '2025-10-23', description: 'Gas Station', amount: -45.00, category: null },
  { id: 7, date: '2025-10-22', description: 'Amazon Purchase', amount: -124.99, category: null },
  { id: 8, date: '2025-10-21', description: 'Restaurant - Chipotle', amount: -18.50, category: null },
  { id: 9, date: '2025-10-20', description: 'Gym Membership', amount: -49.99, category: null },
  { id: 10, date: '2025-10-19', description: 'Electric Bill', amount: -120.00, category: null },
];

const DEFAULT_CATEGORIES = [
  'Groceries',
  'Transportation',
  'Entertainment',
  'Dining',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Income',
  'Subscriptions',
  'Travel',
  'Personal Care',
  'Insurance',
  'Investments',
  'Rent/Mortgage',
];

function TransactionCategories() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const selectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowNewCategoryInput(false);
    setNewCategory('');
  };

  const assignCategory = (category) => {
    if (selectedTransaction) {
      setTransactions(transactions.map(t =>
        t.id === selectedTransaction.id ? { ...t, category } : t
      ));
      setSelectedTransaction(null);
    }
  };

  const handleCreateCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const trimmedCategory = newCategory.trim();
      setCategories([...categories, trimmedCategory]);
      assignCategory(trimmedCategory);
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateCategory();
    }
  };

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <h2>Categorize Transactions</h2>

        <div className="transactions-list">
          {transactions.map(transaction => (
            <div
              key={transaction.id}
              className={`transaction-item ${selectedTransaction?.id === transaction.id ? 'selected' : ''}`}
              onClick={() => selectTransaction(transaction)}
            >
              <div className="transaction-info">
                <div className="transaction-date">{transaction.date}</div>
                <div className="transaction-description">{transaction.description}</div>
              </div>
              <div className="transaction-right">
                <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                </div>
                {transaction.category && (
                  <div className="transaction-category">{transaction.category}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTransaction && (
          <div className="category-selector">
            <h3>Select Category for: {selectedTransaction.description}</h3>
            <div className="categories-grid">
              {categories.map(category => (
                <button
                  key={category}
                  className="category-btn"
                  onClick={() => assignCategory(category)}
                >
                  {category}
                </button>
              ))}
              {!showNewCategoryInput && (
                <button
                  className="category-btn new-category-btn"
                  onClick={() => setShowNewCategoryInput(true)}
                >
                  + Create New
                </button>
              )}
            </div>

            {showNewCategoryInput && (
              <div className="new-category-input">
                <input
                  type="text"
                  placeholder="Enter new category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <button onClick={handleCreateCategory}>Add</button>
                <button onClick={() => {
                  setShowNewCategoryInput(false);
                  setNewCategory('');
                }}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionCategories;
