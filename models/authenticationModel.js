import { query } from "../config/db";

class Authentication {

  static async registerUser(user) {
    try {
      const result = await query(
        `INSERT INTO "User" (email, password) VALUES ($1, $2) RETURNING user_id`,
        [user.email, user.password]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Unique violation
        throw new Error("DUPLICATE_EMAIL");
      }
      // Generic error
      throw new Error("DB_ERROR");
    }
  }

  static async loginUser(email) {
    try {
      const result = await query(`SELECT * FROM "User" WHERE email = $1`, [
        email,
      ]);
      if (result.rows.length === 0) {
        throw {
          status: "error",
          statusCode: 404,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found.",
            details: "The email provided does not match any existing user.",
            path: "users/login",
          },
        };
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }
}
