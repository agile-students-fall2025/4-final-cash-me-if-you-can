import React, { useState, useEffect } from 'react';
import './TransactionCategories.css';
import { transactionAPI, accountAPI } from '../services/api';

function TransactionCategories() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    account_id: '',
    date: new Date().toISOString().split('T')[0],
    name: '',
    amount: '',
    category: '',
    payment_channel: 'other',
    notes: '',
    transactionType: 'expense'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txnResponse, catResponse, accResponse] = await Promise.all([
        transactionAPI.getTransactions(),
        transactionAPI.getCategories(),
        accountAPI.getAccounts()
      ]);

      setTransactions(txnResponse.transactions || []);
      setCategories(catResponse.categories || []);
      setAccounts(accResponse.accounts || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert amount to positive for expenses, negative for income
      const amount = parseFloat(formData.amount);
      const finalAmount = formData.transactionType === 'income' ? -Math.abs(amount) : Math.abs(amount);

      const transactionData = {
        ...formData,
        amount: finalAmount
      };
      delete transactionData.transactionType; // Remove UI-only field

      const response = await transactionAPI.createTransaction(transactionData);
      setTransactions(prev => [response, ...prev]);

      // Reset form
      setFormData({
        account_id: '',
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: '',
        category: '',
        payment_channel: 'other',
        notes: '',
        transactionType: 'expense'
      });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      account_id: transaction.account_id,
      date: transaction.date.split('T')[0],
      name: transaction.name,
      amount: Math.abs(transaction.amount).toString(),
      category: Array.isArray(transaction.category) ? transaction.category[0] : transaction.category,
      payment_channel: transaction.payment_channel || 'other',
      notes: transaction.notes || '',
      transactionType: transaction.amount < 0 ? 'income' : 'expense'
    });
    setSelectedTransaction(transaction);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    setLoading(true);
    try {
      // Convert amount to positive for expenses, negative for income
      const amount = parseFloat(formData.amount);
      const finalAmount = formData.transactionType === 'income' ? -Math.abs(amount) : Math.abs(amount);

      const transactionData = {
        ...formData,
        amount: finalAmount
      };
      delete transactionData.transactionType; // Remove UI-only field

      await transactionAPI.updateTransaction(
        selectedTransaction.transaction_id || selectedTransaction.id,
        transactionData
      );

      loadData();
      setShowEditForm(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionAPI.deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(
        t => t.transaction_id !== transactionId && t.id !== transactionId
      ));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Income': '#10b981',
      'Dining': '#f59e0b',
      'Groceries': '#84cc16',
      'Transportation': '#3b82f6',
      'Entertainment': '#ec4899',
      'Shopping': '#8b5cf6',
      'Utilities': '#06b6d4',
      'Healthcare': '#ef4444',
      'Education': '#6366f1',
      'Subscriptions': '#f97316',
      'Travel': '#14b8a6',
      'Personal Care': '#d946ef',
      'Insurance': '#64748b',
      'Investments': '#22c55e',
      'Rent/Mortgage': '#dc2626'
    };

    if (Array.isArray(category) && category.length > 0) {
      return colors[category[0]] || '#6b7280';
    }
    return colors[category] || '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Manage and categorize your transactions</p>
      </div>

      <div className="transactions-container">
        <div className="section-header">
          <h2>All Transactions</h2>
          <button
            className="add-transaction-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowEditForm(false);
              setSelectedTransaction(null);
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>

        {(showAddForm || showEditForm) && (
          <div className="transaction-form">
            <h3>{showEditForm ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            <form onSubmit={showEditForm ? handleUpdate : handleSubmit}>
              <div className="form-group">
                <label>Transaction Type *</label>
                <div className="transaction-type-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${formData.transactionType === 'expense' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, transactionType: 'expense' }))}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.transactionType === 'income' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, transactionType: 'income' }))}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Account *</label>
                  <select
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.bank_name} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Merchant/Description *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Starbucks, Rent Payment"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Auto-categorize</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Channel</label>
                  <select
                    name="payment_channel"
                    value={formData.payment_channel}
                    onChange={handleInputChange}
                  >
                    <option value="in store">In Store</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional notes about this transaction"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : showEditForm ? 'Update Transaction' : 'Add Transaction'}
                </button>
                {showEditForm && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedTransaction(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {loading && !showAddForm && !showEditForm ? (
          <p className="loading-state">Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map((transaction) => {
              const category = Array.isArray(transaction.category) ? transaction.category[0] : transaction.category;
              const isIncome = transaction.amount < 0;

              return (
                <div key={transaction.transaction_id || transaction.id} className="transaction-item">
                  <div
                    className="category-indicator"
                    style={{ backgroundColor: getCategoryColor(transaction.category) }}
                  />
                  <div className="transaction-main">
                    <div className="transaction-info">
                      <div className="transaction-name">{transaction.name || transaction.merchant_name}</div>
                      <div className="transaction-date">{formatDate(transaction.date)}</div>
                      {transaction.notes && (
                        <div className="transaction-notes">{transaction.notes}</div>
                      )}
                    </div>
                    <div className="transaction-meta">
                      {category && (
                        <span
                          className="transaction-category-badge"
                          style={{ backgroundColor: getCategoryColor(transaction.category) }}
                        >
                          {category}
                        </span>
                      )}
                      <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(transaction)}
                      title="Edit transaction"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(transaction.transaction_id || transaction.id)}
                      title="Delete transaction"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">
            No transactions yet. Click "Add Transaction" to get started!
          </p>
        )}
      </div>
    </div>
  );
}

export default TransactionCategories;
