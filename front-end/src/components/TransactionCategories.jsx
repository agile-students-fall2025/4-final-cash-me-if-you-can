import React, { useState, useEffect } from 'react';
import './TransactionCategories.css';
import categoriesData from '../data/categories.json';
import { transactionAPI } from '../services/api';

function TransactionCategories() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [categories, setCategories] = useState(categoriesData);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await transactionAPI.getCategories();
      if (response?.categories?.length) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getTransactions();
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowNewCategoryInput(false);
    setNewCategory('');
  };

  const assignCategory = async (category) => {
    if (selectedTransaction) {
      try {
        await transactionAPI.updateCategory(selectedTransaction.transaction_id, category);
        setTransactions(transactions.map(t =>
          t.transaction_id === selectedTransaction.transaction_id ? { ...t, category } : t
        ));
        setSelectedTransaction(null);
      } catch (error) {
        console.error('Error updating category:', error);
      }
    }
  };

  const handleCreateCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const trimmedCategory = newCategory.trim();

      // Update backend so list stays in sync
      transactionAPI.createCategory?.(trimmedCategory).catch(() => {
        // If endpoint missing, fallback to local update only
      });

      setCategories(prev => [...prev, trimmedCategory]);
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

        {loading ? (
          <div>Loading transactions...</div>
        ) : (
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div
                key={transaction.transaction_id}
                className={`transaction-item ${selectedTransaction?.transaction_id === transaction.transaction_id ? 'selected' : ''}`}
                onClick={() => selectTransaction(transaction)}
              >
                <div className="transaction-info">
                  <div className="transaction-date">{transaction.date}</div>
                  <div className="transaction-description">{transaction.name || transaction.merchant_name}</div>
                </div>
                <div className="transaction-right">
                  <div className={`transaction-amount ${transaction.amount < 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount < 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  {transaction.category && (
                    <div className="transaction-category">{Array.isArray(transaction.category) ? transaction.category[0] : transaction.category}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTransaction && (
          <div className="category-selector">
            <h3>Select Category for: {selectedTransaction.name || selectedTransaction.merchant_name}</h3>
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
