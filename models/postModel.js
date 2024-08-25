const db = require("../config/db");

class Post {
  /**
   * Create a new Post
   * @param {Object} post - Post object
   * @param {number} post.user_id - User ID
   */
  static async createAnimalPost(post, animal) {
    const client = await db.connect(); // Start a new transaction
    try {
        await client.query('BEGIN'); // Begin transaction

        // Insert into Post table
        const postResult = await client.query(
            `INSERT INTO Post (user_id, reward, lost_longitude, lost_latitude, lost_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                post.user_id,
                post.reward,
                post.lost_longitude,
                post.lost_latitude,
                post.lost_date,
            ]
        );

        const createdPost = postResult.rows[0];

        // Insert into Animal table
        const animalResult = await client.query(
            `INSERT INTO Animal (post_id, name, gender, type, race, age, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                createdPost.post_id,
                animal.name,
                animal.gender,
                animal.type,
                animal.race,
                animal.age,
                animal.description
            ]
        );

        const createdAnimal = animalResult.rows[0];

        await client.query('COMMIT'); // Commit transaction

        return { post: createdPost, animal: createdAnimal }; // Return the created post and animal
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error("Error creating animal post:", error);
        throw error;
    } finally {
        client.release(); // Release the client back to the pool
    }
}


  /**
   * Find a post by ID
   * @param {number} post_id - Post ID
   * @returns {Object} Post object
   */
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

  /**
   * Find all nearby posts ordered by distance
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} radius - Radius
   * @returns {Object} Post object
   */
  static async findByNearbyOrderedByDistance(longitude, latitude, radius) {
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

      return result.rows;
    } catch (error) {
      console.error("Error finding nearby posts:", error);
      throw error;
    }
  }

  /**
   * Find all nearby posts ordered by reward
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} radius - Radius
   * @returns {Object} Post object
   */
  static async findByNearbyOrderedByReward(longitude, latitude, radius) {
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
        ORDER BY reward DESC;
      `;
      const values = [latitude, longitude, radius];
      const result = await db.query(query, values);

      return result.rows;
    } catch (error) {
      console.error("Error finding nearby posts ordered by reward:", error);
      throw error;
    }
  }

  /**
   * Find all nearby posts ordered by date posted
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} radius - Radius
   * @returns {Object} Post object
   */
  static async findByNearbyOrderedByDatePosted(longitude, latitude, radius) {
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
        ORDER BY created_at DESC;
      `;
      const values = [latitude, longitude, radius];
      const result = await db.query(query, values);

      return result.rows;
    } catch (error) {
      console.error(
        "Error finding nearby posts ordered by date posted:",
        error
      );
      throw error;
    }
  }

  /**
   * Update a post by ID
   * @param {number} post_id - Post ID
   * @param {Object} updatedPost - Updated Post object
   */
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

  /**
   * Delete a post by ID
   * @param {number} post_id - Post ID
   * @returns {Object} Deleted Post object
   */
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

  /**
   * Retrieve all posts
   * @returns {Array} Array of Post objects
   * @throws {Error} DB error
   */
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
