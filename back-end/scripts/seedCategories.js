require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { connectDB } = require('../config/database');

const defaultCategories = [
  {
    name: 'Groceries',
    system: true,
    icon: '🛒',
    color: '#4CAF50',
    keywords: ['whole foods', 'trader joe', 'safeway', 'kroger', 'walmart', 'costco', 'grocery', 'food store'],
  },
  {
    name: 'Transportation',
    system: true,
    icon: '🚗',
    color: '#2196F3',
    keywords: ['uber', 'lyft', 'shell', 'chevron', 'gas station', 'mta', 'parking', 'transit', 'bus'],
  },
  {
    name: 'Dining',
    system: true,
    icon: '🍽️',
    color: '#FF5722',
    keywords: ['starbucks', 'dunkin', 'chipotle', 'restaurant', 'coffee', 'cafe', 'bar', 'pizza'],
  },
  {
    name: 'Entertainment',
    system: true,
    icon: '🎬',
    color: '#9C27B0',
    keywords: ['netflix', 'spotify', 'hulu', 'disney', 'cinema', 'movie', 'gaming', 'game', 'playstation'],
  },
  {
    name: 'Shopping',
    system: true,
    icon: '🛍️',
    color: '#FF6B9D',
    keywords: ['amazon', 'ebay', 'best buy', 'clothing', 'store', 'mall', 'target', 'kohl'],
  },
  {
    name: 'Utilities',
    system: true,
    icon: '⚡',
    color: '#FFC107',
    keywords: ['electric', 'water', 'gas bill', 'internet', 'verizon', 'att', 'comcast', 'utility'],
  },
  {
    name: 'Healthcare',
    system: true,
    icon: '⚕️',
    color: '#00BCD4',
    keywords: ['cvs', 'walgreens', 'pharmacy', 'hospital', 'doctor', 'dentist', 'gym', 'fitness', 'medical'],
  },
  {
    name: 'Travel',
    system: true,
    icon: '✈️',
    color: '#673AB7',
    keywords: ['airline', 'delta', 'hotel', 'airbnb', 'booking', 'expedia', 'travel', 'flight'],
  },
  {
    name: 'Income',
    system: true,
    icon: '💰',
    color: '#4CAF50',
    keywords: ['payroll', 'salary', 'deposit', 'interest', 'dividend', 'income', 'payment'],
  },
  {
    name: 'Subscriptions',
    system: true,
    icon: '📱',
    color: '#2196F3',
    keywords: ['subscription', 'monthly', 'annual', 'premium', 'membership'],
  },
  {
    name: 'Education',
    system: true,
    icon: '📚',
    color: '#3F51B5',
    keywords: ['school', 'tuition', 'education', 'course', 'udemy', 'university', 'college'],
  },
  {
    name: 'Personal Care',
    system: true,
    icon: '💇',
    color: '#E91E63',
    keywords: ['salon', 'barber', 'haircut', 'spa', 'beauty', 'personal care'],
  },
  {
    name: 'Insurance',
    system: true,
    icon: '🛡️',
    color: '#607D8B',
    keywords: ['insurance', 'geico', 'allstate', 'progressive', 'policy'],
  },
  {
    name: 'Investments',
    system: true,
    icon: '📈',
    color: '#00695C',
    keywords: ['investment', 'stock', 'broker', 'brokerage', 'trading'],
  },
  {
    name: 'Rent/Mortgage',
    system: true,
    icon: '🏠',
    color: '#8B4513',
    keywords: ['rent', 'mortgage', 'landlord', 'property', 'housing'],
  },
];

async function seedCategories() {
  try {
    await connectDB();

    // Clear existing system categories
    await Category.deleteMany({ system: true });

    // Insert default categories
    const created = await Category.insertMany(defaultCategories);
    console.log(`✓ Successfully seeded ${created.length} default categories`);

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding categories:', error.message);
    process.exit(1);
  }
}

seedCategories();
