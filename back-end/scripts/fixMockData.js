const fs = require('fs');
const path = require('path');

// Read the mock transactions file
const mockTransactionsPath = path.join(__dirname, '../data/mockTransactions.json');
const mockTransactions = JSON.parse(fs.readFileSync(mockTransactionsPath, 'utf8'));

// Flip the signs: income (positive) -> negative, expenses (negative) -> positive
const fixedTransactions = mockTransactions.map(txn => {
  return {
    ...txn,
    amount: -txn.amount  // Flip the sign
  };
});

// Write back to file
fs.writeFileSync(mockTransactionsPath, JSON.stringify(fixedTransactions, null, 2));

console.log(`✅ Fixed ${fixedTransactions.length} transactions`);
console.log('Convention: Positive amounts = expenses, Negative amounts = income');
