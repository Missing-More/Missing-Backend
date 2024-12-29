import db from "../config/db.js"; // ES Module import syntax

class User {
  static async getUser(id) {
    try {
      const result = await db.query(
        `SELECT user_id, name, email, phone, profile_image_url, account_type FROM "User" WHERE user_id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const result = await db.query(
        `SELECT * FROM "User" WHERE email = $1`,
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async updateUser(user) {
    try {
      const result = await db.query(
        `UPDATE "User" SET name = $1, profile_image_url = $2, is_premium = $3, account_type = $4 WHERE user_id = $5 RETURNING user_id`,
        [user.name, user.profile_image_url, user.is_premium, user.account_type, user.user_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const result = await db.query(`DELETE FROM "User" WHERE user_id = $1`, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  static async createUser(user) {
    try {
      const result = await db.query(
        `INSERT INTO "User" (email, password) VALUES ($1, $2) RETURNING user_id`,
        [user.email, user.password]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
}

export default User; // ES Module export syntax
