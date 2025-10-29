import './TransactionCategories.css';

const MOCK_ACCOUNTS = [
  { id: 1, name: 'Checking', type: 'checking', balance: 5848.32 },
  { id: 2, name: 'Savings', type: 'savings', balance: 12450.75 },
  { id: 3, name: 'Credit Card', type: 'credit', balance: -1243.50 }
];

function Accounts() {
  const totalBalance = MOCK_ACCOUNTS.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="transactions-container">
      <h2>Accounts</h2>

      <div className="transaction-item">
        <div className="transaction-info">
          <div className="transaction-date">Total Balance</div>
          <div className="transaction-description">${totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className="transactions-list">
        {MOCK_ACCOUNTS.map(account => (
          <div key={account.id} className="transaction-item">
            <div className="transaction-info">
              <div className="transaction-description">{account.name}</div>
            </div>
            <div className="transaction-right">
              <div className={`transaction-amount ${account.balance < 0 ? 'negative' : 'positive'}`}>
                ${Math.abs(account.balance).toFixed(2)}
              </div>
              {account.type === 'credit' && account.balance < 0 && (
                <div className="transaction-category">owed</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Accounts;