const db = require("../config/db");

class Post {
  // Create a new post
  static async create(post) {
    try {
      const result = await db.query(
        `INSERT INTO Post (user_id, title, description, category, reward, lost_longitude, lost_latitude, lost_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
        [
          post.user_id,
          post.title,
          post.description,
          post.category,
          post.reward,
          post.lost_longitude,
          post.lost_latitude,
          post.lost_date,
        ]
      );
      return result.rows[0]; // Return the created post
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  // Find a post by ID
  static async findById(post_id) {
    try {
      const result = await db.query(`SELECT * FROM Post WHERE post_id = $1`, [
        post_id,
      ]);
      if (result.rows.length === 0) {
        throw { kind: "not_found", message: "Post not found" };
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error finding post:", error);
      throw error;
    }
  }

// Find nearby posts
static async findByNearby(longitude, latitude, radius) {
    try {
        const query = `
            SELECT * FROM (
                SELECT *, (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(lost_latitude::float)) * cos(radians(lost_longitude::float) - radians($2)) +
                        sin(radians($1)) * sin(radians(lost_latitude::float))
                    )
                ) AS distance
                FROM Post
            ) AS subquery
            WHERE distance < $3
            ORDER BY distance;
        `;

        const values = [latitude, longitude, radius];
        const result = await db.query(query, values);

        console.log(result.rows);
        return result.rows;
    } catch (error) {
        console.error("Error finding nearby posts:", error);
        throw error;
    }
}


  // Update a post by ID
  static async updateById(post_id, updatedPost) {
    try {
      const result = await db.query(
        `UPDATE Post 
                 SET title = $1, description = $2, category = $3, reward = $4, 
                     lost_location = $5, lost_date = $6, updated_at = CURRENT_TIMESTAMP
                 WHERE post_id = $7
                 RETURNING *`,
        [
          updatedPost.title,
          updatedPost.description,
          updatedPost.category,
          updatedPost.reward,
          updatedPost.lost_location,
          updatedPost.lost_date,
          post_id,
        ]
      );
      if (result.rows.length === 0) {
        throw { kind: "not_found", message: "Post not found" };
      }
      return result.rows[0]; // Return the updated post
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  // Delete a post by ID
  static async deleteById(post_id) {
    try {
      const result = await db.query(
        `DELETE FROM Post WHERE post_id = $1 RETURNING *`,
        [post_id]
      );
      if (result.rows.length === 0) {
        throw { kind: "not_found", message: "Post not found" };
      }
      return result.rows[0]; // Return the deleted post
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  // Get all posts
  static async getAll() {
    try {
      const result = await db.query(
        `SELECT * FROM Post ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error("Error retrieving posts:", error);
      throw error;
    }
  }
}

module.exports = Post;
