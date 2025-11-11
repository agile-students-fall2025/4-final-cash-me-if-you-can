require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI client
// TODO: Add your OpenAI API key to .env file
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

module.exports = openai;
