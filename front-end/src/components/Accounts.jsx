import './TransactionCategories.css';
import accountsData from '../data/accounts.json';

function Accounts() {
  const totalBalance = accountsData.reduce((sum, account) => sum + account.balance, 0);

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
        {accountsData.map(account => (
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