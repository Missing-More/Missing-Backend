const User = require('../models/userModel'); // Adjust the path as necessary
const db = require('../config/db');
jest.mock('../../config/db'); // Mock the database module

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should retrieve a user by ID', async () => {
      const mockUser = {
        user_id: 1,
        name: 'John Doe',
        profile_image_url: 'http://example.com/profile.jpg',
        is_premium: false,
        account_type: 'basic'
      };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const user = await User.getUser(1);
      expect(user).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        `SELECT user_id, name, profile_image_url, is_premium, account_type FROM "User" WHERE user_id = $1`,
        [1]
      );
    });

    it('should throw an error if the user is not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.getUser(1)).rejects.toThrow('User with ID 1 not found');
    });
  });

  describe('updateUser', () => {
    it('should update a user\'s information', async () => {
      const mockUser = {
        user_id: 1,
        name: 'John Doe',
        profile_image_url: 'http://example.com/profile.jpg',
        is_premium: true,
        account_type: 'premium'
      };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const updatedUser = await User.updateUser(mockUser);
      expect(updatedUser).toEqual({ user_id: 1 });
      expect(db.query).toHaveBeenCalledWith(
        `UPDATE "User" SET name = $1, profile_image_url = $2, is_premium = $3, account_type = $4 WHERE user_id = $5 RETURNING user_id`,
        [mockUser.name, mockUser.profile_image_url, mockUser.is_premium, mockUser.account_type, mockUser.user_id]
      );
    });

    it('should throw an error if the user is not found during update', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.updateUser({ user_id: 1 })).rejects.toThrow('User with ID 1 not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      db.query.mockResolvedValue({ rows: [{ user_id: 1 }] });

      const deletedUser = await User.deleteUser(1);
      expect(deletedUser).toEqual({ user_id: 1 });
      expect(db.query).toHaveBeenCalledWith(
        `DELETE FROM "User" WHERE user_id = $1 RETURNING user_id`,
        [1]
      );
    });

    it('should throw an error if the user is not found during deletion', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.deleteUser(1)).rejects.toThrow('User with ID 1 not found');
    });
  });
});
