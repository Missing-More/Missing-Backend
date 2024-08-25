const db = require("../config/db"); // Adjust the path to your PostgreSQL database configuration

class User {
  static async create(user) {
    try {
      console.log("Creating user:", user);
      const result = await db.query(
        `INSERT INTO "User" (email, password) VALUES ($1, $2) RETURNING user_id`,
        [user.email, user.password]
      );
      return {
        status: "success",
        data: {
          id: result.rows[0].user_id,
          email: user.email,
        },
      };
    } catch (error) {
      if (error.code === "23505") {
        // PostgreSQL unique violation error code
        console.error("Error: Duplicate entry for email:", user.email);
        throw {
          status: "error",
          statusCode: 400,
          error: {
            code: "ERROR_DUPLICATE_ENTRY",
            message: "Email already exists",
            details:
              "The email provided already exists. Please provide a different email to register a new user.",
            path: "users/register",
          },
        };
      }
      console.error("Error creating user:", error);
      throw {
        status: "error",
        statusCode: 500,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred.",
          details: error.message,
          path: "users/register",
        },
      };
    }
  }

  static async findByEmail(email) {
    try {
      const result = await db.query(`SELECT * FROM "User" WHERE email = $1`, [
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

  static async findById(id) {
    try {
      const result = await db.query(`SELECT * FROM "User" WHERE user_id = $1`, [
        id,
      ]);
      if (result.rows.length === 0) {
        throw {
          status: "error",
          statusCode: 404,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found.",
            details: "The user ID provided does not match any existing user.",
          },
        };
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by id:", error);
      throw error;
    }
  }
}

module.exports = User;
