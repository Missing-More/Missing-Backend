const { Pool } = require('pg');

// Create a mock for the Pool class
const mockQuery = jest.fn();
const mockConnect = jest.fn(() => ({
  query: mockQuery,
  release: jest.fn(),
}));
const mockEnd = jest.fn();

const mockPool = {
  connect: mockConnect,
  end: mockEnd,
  query: mockQuery // Add the query method to mockPool
};

// Replace the default Pool class with our mock
jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool),
}));

module.exports = {
  mockPool,
  mockQuery,
}