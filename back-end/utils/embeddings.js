/**
 * Embedding utilities for RAG
 * In production with OpenAI API key, this would use real embeddings
 * For demo, we simulate embeddings with keyword extraction
 */

/**
 * Mock embedding function
 * TODO: Replace with OpenAI embeddings when API key is added
 * Example: const response = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
 */
function createEmbedding(text) {
  // For demo: return normalized keyword array as mock embedding
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 10); // Mock "embedding vector"
}

/**
 * Calculate similarity between two texts
 * In production, this would be cosine similarity between embedding vectors
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return intersection.size / union.size;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text, maxKeywords = 5) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

module.exports = {
  createEmbedding,
  calculateSimilarity,
  extractKeywords
};
