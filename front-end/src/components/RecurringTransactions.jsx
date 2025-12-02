import React, { useState, useEffect } from 'react';
import './RecurringTransactions.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const CATEGORIES = [
  'Income', 'Rent', 'Utilities', 'Subscriptions', 'Insurance',
  'Groceries', 'Dining', 'Transportation', 'Entertainment',
  'Healthcare', 'Shopping', 'Education', 'Savings', 'Other'
];

function RecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    account_id: '',
    name: '',
    merchant_name: '',
    amount: '',
    category: 'Other',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    day_of_month: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recurringRes, accountsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/recurring-transactions`),
        fetch(`${API_BASE_URL}/accounts`)
      ]);
      const recurringData = await recurringRes.json();
      const accountsData = await accountsRes.json();
      setRecurringTransactions(recurringData);
      setAccounts(accountsData);
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

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      day_of_month: formData.day_of_month ? parseInt(formData.day_of_month) : null
    };

    try {
      if (editingId) {
        // Update existing
        await fetch(`${API_BASE_URL}/recurring-transactions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        await fetch(`${API_BASE_URL}/recurring-transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    }
  };

  const handleEdit = (recurring) => {
    setEditingId(recurring._id);
    setFormData({
      account_id: recurring.account_id,
      name: recurring.name,
      merchant_name: recurring.merchant_name || '',
      amount: recurring.amount.toString(),
      category: recurring.category[0] || 'Other',
      frequency: recurring.frequency,
      start_date: new Date(recurring.start_date).toISOString().split('T')[0],
      end_date: recurring.end_date ? new Date(recurring.end_date).toISOString().split('T')[0] : '',
      day_of_month: recurring.day_of_month || '',
      notes: recurring.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const handleToggleActive = async (recurring) => {
    try {
      await fetch(`${API_BASE_URL}/recurring-transactions/${recurring._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !recurring.is_active })
      });
      loadData();
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      account_id: '',
      name: '',
      merchant_name: '',
      amount: '',
      category: 'Other',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      day_of_month: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getFrequencyLabel = (frequency) => {
    return FREQUENCIES.find(f => f.value === frequency)?.label || frequency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="recurring-page">
        <div className="loading-state">Loading recurring transactions...</div>
      </div>
    );
  }

  return (
    <div className="recurring-page">
      <div className="page-header">
        <h1>Recurring Transactions</h1>
        <p>Manage your recurring income and expenses</p>
      </div>

      <div className="recurring-container">
        <div className="section-header">
          <h2>Your Recurring Transactions</h2>
          <button
            className="add-recurring-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Recurring'}
          </button>
        </div>

        {showForm && (
          <div className="recurring-form">
            <h3>{editingId ? 'Edit Recurring Transaction' : 'Add New Recurring Transaction'}</h3>
            <form onSubmit={handleSubmit}>
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
                    {accounts.map(account => (
                      <option key={account._id} value={account.account_id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Netflix Subscription"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Merchant Name</label>
                  <input
                    type="text"
                    name="merchant_name"
                    value={formData.merchant_name}
                    onChange={handleInputChange}
                    placeholder="Optional"
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
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Frequency *</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                  >
                    {FREQUENCIES.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day of Month (for monthly/quarterly)</label>
                  <input
                    type="number"
                    name="day_of_month"
                    value={formData.day_of_month}
                    onChange={handleInputChange}
                    placeholder="1-31"
                    min="1"
                    max="31"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingId ? 'Update' : 'Add'} Recurring Transaction
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="recurring-list">
          {recurringTransactions.length === 0 ? (
            <div className="empty-state">
              No recurring transactions yet. Click "Add Recurring" to create one.
            </div>
          ) : (
            recurringTransactions.map(recurring => (
              <div
                key={recurring._id}
                className={`recurring-item ${!recurring.is_active ? 'inactive' : ''}`}
              >
                <div className="recurring-main">
                  <div className="recurring-info">
                    <div className="recurring-header">
                      <h3 className="recurring-name">{recurring.name}</h3>
                      <span className={`status-badge ${recurring.is_active ? 'active' : 'inactive'}`}>
                        {recurring.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="recurring-details">
                      {getFrequencyLabel(recurring.frequency)} •
                      {recurring.category && recurring.category[0] && ` ${recurring.category[0]} • `}
                      Next: {formatDate(recurring.next_occurrence)}
                    </p>
                    {recurring.notes && (
                      <p className="recurring-notes">{recurring.notes}</p>
                    )}
                  </div>

                  <div className="recurring-meta">
                    <p className={`recurring-amount ${recurring.amount < 0 ? 'income' : 'expense'}`}>
                      ${Math.abs(recurring.amount).toFixed(2)}
                    </p>
                    <p className="recurring-frequency">{getFrequencyLabel(recurring.frequency)}</p>
                  </div>
                </div>

                <div className="recurring-actions">
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleActive(recurring)}
                    title={recurring.is_active ? 'Pause' : 'Resume'}
                  >
                    {recurring.is_active ? '⏸' : '▶'}
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(recurring)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(recurring._id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RecurringTransactions;
