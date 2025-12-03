require('dotenv').config();
const { Document } = require('@langchain/core/documents');
const { LanceDB } = require('@langchain/community/vectorstores/lancedb');
const lancedb = require('@lancedb/lancedb');
const { OpenAIEmbeddings } = require('@langchain/openai');

const { SimpleTokenizerEmbeddings } = require('./simpleEmbeddings');
const financialKnowledge = require('../data/financialKnowledge.json');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const LANCEDB_PATH = process.env.LANCEDB_PATH || './data/lancedb';
const LANCEDB_TABLE = process.env.LANCEDB_TABLE || 'cashme_mock_data';

const embeddings = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key'
  ? new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY })
  : new SimpleTokenizerEmbeddings({ dimension: 384 });

let documents = [];
let lanceStorePromise = null;
let fallbackStore = null;

/**
 * Build documents from MongoDB data
 * This function fetches current data from MongoDB instead of static files
 */
async function buildDocuments() {
  const docs = [];

  // Add financial knowledge (static)
  financialKnowledge.forEach((item, index) => {
    docs.push(new Document({
      pageContent: `${item.title}\n\n${item.content}`,
      metadata: {
        id: item.id || `knowledge-${index}`,
        title: item.title,
        category: item.category,
        keywords: item.keywords,
        type: 'knowledge',
      },
    }));
  });

  try {
    // Fetch accounts from MongoDB
    const accounts = await Account.find({}).lean();
    accounts.forEach((account, index) => {
      const title = `Account: ${account.name}`;
      docs.push(new Document({
        pageContent: `${account.name} (${account.subtype}) currently holds $${account.balances.current}. Available: ${account.balances.available || account.balances.current}. Limit: ${account.balances.limit ?? 'n/a'}.`,
        metadata: {
          id: account.account_id || `account-${index}`,
          title,
          type: 'account',
          keywords: [account.type, account.subtype, account.name],
        },
      }));
    });

    // Fetch transactions from MongoDB (last 90 days to keep vector DB manageable)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const transactions = await Transaction.find({ date: { $gte: ninetyDaysAgo } }).lean();
    
    transactions.forEach((transaction, index) => {
      const category = Array.isArray(transaction.category) && transaction.category.length > 0 
        ? transaction.category[0] 
        : 'Uncategorized';
      const title = `Transaction: ${transaction.name || transaction.merchant_name}`;
      const dateStr = transaction.date instanceof Date 
        ? transaction.date.toISOString().split('T')[0] 
        : transaction.date;
      
      docs.push(new Document({
        pageContent: `${transaction.name || transaction.merchant_name} on ${dateStr} for $${Math.abs(transaction.amount)}. Category: ${category}. Merchant: ${transaction.merchant_name || 'n/a'}.`,
        metadata: {
          id: transaction.transaction_id || `transaction-${index}`,
          title,
          type: 'transaction',
          category,
          keywords: [transaction.name, transaction.merchant_name, category].filter(Boolean),
        },
      }));
    });

    console.log(`[vectorStore] Built ${docs.length} documents (${accounts.length} accounts, ${transactions.length} transactions)`);
  } catch (error) {
    console.warn('[vectorStore] Error fetching MongoDB data, using knowledge base only:', error.message);
  }

  return docs;
}



function toFallbackDocs(langchainDocs) {
  return langchainDocs.map(doc => ({
    title: doc.metadata?.title || doc.metadata?.type || 'Knowledge',
    content: doc.pageContent,
    category: doc.metadata?.category || doc.metadata?.type || '',
    keywords: doc.metadata?.keywords || [],
  }));
}

class KeywordFallbackStore {
  constructor(documents) {
    this.documents = documents;
  }

  search(query, topK = 3) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    const scoredDocs = this.documents.map(doc => {
      let score = 0;

      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      if (doc.content.toLowerCase().includes(queryLower)) {
        score += 5;
      }

      doc.keywords.forEach(keyword => {
        if (!keyword) return;
        const key = keyword.toLowerCase();
        if (queryLower.includes(key)) {
          score += 3;
        }
        queryWords.forEach(word => {
          if (key.includes(word) && word.length > 3) {
            score += 1;
          }
        });
      });

      if (doc.category && queryLower.includes(doc.category.toLowerCase())) {
        score += 2;
      }

      return { ...doc, score };
    });

    return scoredDocs
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(doc => ({ title: doc.title, content: doc.content }));
  }
}

/**
 * Initialize the vector store with current MongoDB data
 */
async function initializeVectorStore() {
  documents = await buildDocuments();
  fallbackStore = new KeywordFallbackStore(toFallbackDocs(documents));
  // Reset lance store to force rebuild
  lanceStorePromise = null;
}

async function getLanceStore() {
  // Ensure documents are loaded
  if (documents.length === 0) {
    await initializeVectorStore();
  }

  if (!lanceStorePromise) {
    lanceStorePromise = (async () => {
      const db = await lancedb.connect(LANCEDB_PATH);
      return LanceDB.fromDocuments(documents, embeddings, {
        tableName: LANCEDB_TABLE,
        db,
      });
    })();
  }

  return lanceStorePromise;
}

async function search(query, topK = 3) {
  // Ensure fallback store is initialized
  if (!fallbackStore) {
    await initializeVectorStore();
  }

  try {
    const store = await getLanceStore();
    const results = await store.similaritySearch(query, topK);
    if (results?.length) {
      return results.map(doc => ({
        title: doc.metadata?.title || doc.metadata?.type || 'Knowledge',
        content: doc.pageContent,
      }));
    }
  } catch (error) {
    console.warn('[vectorStore] LanceDB query failed, using fallback search:', error.message);
    lanceStorePromise = null; // allow retry next time
  }

  return fallbackStore.search(query, topK);
}

/**
 * Sync vector store with current MongoDB data
 * Call this after adding/updating accounts or transactions
 */
async function syncVectorStore() {
  console.log('[vectorStore] Syncing with MongoDB...');
  await initializeVectorStore();
  console.log('[vectorStore] Sync complete');
}

module.exports = {
  search,
  syncVectorStore,
  initializeVectorStore,
};
