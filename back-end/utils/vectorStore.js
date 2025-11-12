const financialKnowledge = require('../data/financialKnowledge.json');

/**
 * Mock vector store for RAG functionality
 * In production, this would use a real vector database like Pinecone, Weaviate, or ChromaDB
 * For now, we use keyword matching to simulate semantic search
 */

class VectorStore {
  constructor() {
    this.documents = financialKnowledge;
  }

  /**
   * Simulate semantic search using keyword matching
   * @param {string} query - User query
   * @param {number} topK - Number of results to return
   * @returns {Array} - Relevant documents
   */
  search(query, topK = 3) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // Score each document based on keyword matches
    const scoredDocs = this.documents.map(doc => {
      let score = 0;

      // Check title match
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Check content match
      if (doc.content.toLowerCase().includes(queryLower)) {
        score += 5;
      }

      // Check keyword matches
      doc.keywords.forEach(keyword => {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 3;
        }
        queryWords.forEach(word => {
          if (keyword.toLowerCase().includes(word) && word.length > 3) {
            score += 1;
          }
        });
      });

      // Check category match
      if (queryLower.includes(doc.category)) {
        score += 2;
      }

      return { ...doc, score };
    });

    // Sort by score and return top K
    return scoredDocs
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ score, ...doc }) => doc);
  }

  /**
   * Get document by ID
   */
  getById(id) {
    return this.documents.find(doc => doc.id === id);
  }

  /**
   * Get documents by category
   */
  getByCategory(category) {
    return this.documents.filter(doc => doc.category === category);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return [...new Set(this.documents.map(doc => doc.category))];
  }
}

// Singleton instance
const vectorStore = new VectorStore();

module.exports = vectorStore;
