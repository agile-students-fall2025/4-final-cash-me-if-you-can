import React, { useState } from 'react';
import './TransactionCategories.css';
import transactionsData from '../data/transactions.json';
import categoriesData from '../data/categories.json';

function TransactionCategories() {
  const [transactions, setTransactions] = useState(transactionsData);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [categories, setCategories] = useState(categoriesData);
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
