/**
 * Expense categorization logic
 * Auto-categorizes transactions based on merchant name and description
 */

const categoryKeywords = {
  Groceries: [
    'whole foods',
    'trader joe',
    'safeway',
    'kroger',
    'walmart',
    'target',
    'costco',
    'grocery',
    'market',
    'food lion',
    'publix',
  ],
  Transportation: [
    'uber',
    'lyft',
    'shell',
    'chevron',
    'exxon',
    'gas',
    'metro',
    'mta',
    'transit',
    'parking',
    'subway',
    'train',
    'bus',
  ],
  Dining: [
    'restaurant',
    'starbucks',
    'dunkin',
    'chipotle',
    'mcdonalds',
    'burger',
    'pizza',
    'cafe',
    'coffee',
    'bar',
    'grill',
    'diner',
    'kitchen',
  ],
  Entertainment: [
    'netflix',
    'spotify',
    'hulu',
    'disney',
    'hbo',
    'cinema',
    'movie',
    'theater',
    'concert',
    'ticket',
    'gaming',
    'steam',
  ],
  Shopping: [
    'amazon',
    'ebay',
    'best buy',
    'apple store',
    'mall',
    'clothing',
    'fashion',
    'store',
  ],
  Utilities: [
    'electric',
    'water',
    'gas bill',
    'internet',
    'phone',
    'verizon',
    'att',
    't-mobile',
    'comcast',
    'spectrum',
    'coned',
    'conedison',
  ],
  Healthcare: [
    'cvs',
    'walgreens',
    'pharmacy',
    'hospital',
    'medical',
    'doctor',
    'dentist',
    'health',
    'clinic',
    'gym',
    'fitness',
  ],
  Insurance: [
    'insurance',
    'geico',
    'state farm',
    'progressive',
    'allstate',
  ],
  'Rent/Mortgage': [
    'rent',
    'mortgage',
    'landlord',
    'property',
    'housing',
  ],
  Subscriptions: [
    'subscription',
    'monthly',
    'membership',
  ],
  Travel: [
    'airline',
    'delta',
    'american airlines',
    'united',
    'hotel',
    'airbnb',
    'booking',
    'expedia',
    'travel',
  ],
  Income: [
    'payroll',
    'salary',
    'deposit',
    'interest',
    'dividend',
  ],
};

/**
 * Categorize a transaction based on merchant name and description
 */
function categorizeTransaction(transaction) {
  const searchText = `${transaction.name || ''} ${transaction.merchant_name || ''} ${
    transaction.description || ''
  }`.toLowerCase();

  // Check for income (negative amounts in Plaid means money coming in)
  if (transaction.amount < 0) {
    return 'Income';
  }

  // Search for category keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // Default to Shopping if no match
  return 'Shopping';
}

/**
 * Bulk categorize transactions
 */
function categorizeTransactions(transactions) {
  return transactions.map(transaction => ({
    ...transaction,
    category: categorizeTransaction(transaction),
  }));
}

/**
 * Get category suggestions based on merchant name
 */
function suggestCategories(merchantName) {
  const searchText = merchantName.toLowerCase();
  const suggestions = [];

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        suggestions.push(category);
        break;
      }
    }
  }

  return suggestions.length > 0 ? suggestions : ['Shopping', 'Dining', 'Entertainment'];
}

module.exports = {
  categorizeTransaction,
  categorizeTransactions,
  suggestCategories,
  categoryKeywords,
};
