require('dotenv').config();
const { Document } = require('@langchain/core/documents');
const { LanceDB } = require('@langchain/community/vectorstores/lancedb');
const lancedb = require('@lancedb/lancedb');
const { OpenAIEmbeddings } = require('@langchain/openai');

const { SimpleTokenizerEmbeddings } = require('./simpleEmbeddings');
const financialKnowledge = require('../data/financialKnowledge.json');
const mockAccounts = require('../data/mockAccounts.json');
const mockTransactions = require('../data/mockTransactions.json');

const LANCEDB_PATH = process.env.LANCEDB_PATH || './data/lancedb';
const LANCEDB_TABLE = process.env.LANCEDB_TABLE || 'cashme_mock_data';

const embeddings = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key'
  ? new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY })
  : new SimpleTokenizerEmbeddings({ dimension: 384 });

const documents = buildDocuments();
let lanceStorePromise = null;

function buildDocuments() {
  const docs = [];

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

  mockAccounts.forEach((account, index) => {
    const title = `Account: ${account.name}`;
    docs.push(new Document({
      pageContent: `${account.name} (${account.subtype}) currently holds $${account.balances.current}. Available: ${account.balances.available}. Limit: ${account.balances.limit ?? 'n/a'}.`,
      metadata: {
        id: account.account_id || `account-${index}`,
        title,
        type: 'account',
        keywords: [account.type, account.subtype, account.name],
      },
    }));
  });

  mockTransactions.forEach((transaction, index) => {
    const category = Array.isArray(transaction.category) ? transaction.category[0] : transaction.category;
    const title = `Transaction: ${transaction.name || transaction.merchant_name}`;
    docs.push(new Document({
      pageContent: `${transaction.name || transaction.merchant_name} on ${transaction.date} for $${transaction.amount}. Category: ${category}. Merchant: ${transaction.merchant_name || 'n/a'}. Location: ${transaction.city || ''} ${transaction.state || ''}`,
      metadata: {
        id: transaction.transaction_id || `transaction-${index}`,
        title,
        type: 'transaction',
        category,
        keywords: [transaction.name, transaction.merchant_name, category].filter(Boolean),
      },
    }));
  });

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

const fallbackStore = new KeywordFallbackStore(toFallbackDocs(documents));

async function getLanceStore() {
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

module.exports = {
  search,
};
