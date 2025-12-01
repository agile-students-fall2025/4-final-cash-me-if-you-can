const crypto = require('crypto');

class SimpleTokenizerEmbeddings {
  constructor(options = {}) {
    this.dimension = options.dimension || 512;
  }

  async embedDocuments(texts) {
    return texts.map(text => this.embedText(text));
  }

  async embedQuery(text) {
    return this.embedText(text);
  }

  embedText(text = '') {
    const vector = new Array(this.dimension).fill(0);
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    tokens.forEach(token => {
      const hash = crypto.createHash('md5').update(token).digest('hex');
      const bucket = parseInt(hash.slice(0, 8), 16) % this.dimension;
      vector[bucket] += 1;
    });

    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map(value => value / magnitude);
  }
}

module.exports = { SimpleTokenizerEmbeddings };
