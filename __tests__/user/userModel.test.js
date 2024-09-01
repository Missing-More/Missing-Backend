//const { Pool } = require('pg');
const pool = require('../../config/db'); // Adjust path as needed
const { mockPool, mockQuery } = require('../../mocks/pg.js'); // Adjust path as needed
const userModel = require('../../models/userModel');

// Mock the db module to prevent actual database connections
jest.mock('../../config/db', () => ({
    query: jest.fn(),
    connect: jest.fn(),
  }));
  
  jest.mock('../../models/userModel', () => ({
    createUser: jest.fn(),
  }));
  
  describe('userModel', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'password123' };
      userModel.createUser.mockResolvedValueOnce(mockUser);
  
      const result = await userModel.createUser('test@example.com', 'password123');
      console.log(result);
      expect(result).toEqual(mockUser);
      expect(userModel.createUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });


  /*it('should handle errors', async () => {
    // Simulate an error from the database
    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    await expect(
      pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2)',
        ['error@example.com', 'password123']
      )
    ).rejects.toThrow('Database error');

    expect(mockQuery).toHaveBeenCalledWith(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      ['error@example.com', 'password123']
    );
  });*/