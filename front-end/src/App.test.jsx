import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import React from 'react';

test('renders without crashing', () => {
  render(<App />);
});
