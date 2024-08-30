const db = require("../config/db");

class Post {
  static async createPost(req) {
    const client = await db.connect(); // Start a new transaction
    try {
      await client.query("BEGIN"); // Begin transaction

      // Insert into Post table
      const postResult = await client.query(
        `INSERT INTO "Post" (user_id, reward, lost_longitude, lost_latitude, lost_date, category_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
        [
          req.userId,
          req.body.post.reward,
          req.body.post.lost_longitude,
          req.body.post.lost_latitude,
          req.body.post.lost_date,
          req.body.post.category_id,
        ]
      );
      const createdPost = postResult.rows[0];

      var entityResult;
      const category_id = req.body.post.category_id;

      switch (category_id) {
        case 1: // Animal
          entityResult = await client.query(
            `INSERT INTO "Animal" (post_id, name, gender, type, race, age, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
            [
              createdPost.post_id,
              req.body.entity.name,
              req.body.entity.gender,
              req.body.entity.type,
              req.body.entity.race,
              req.body.entity.age,
              req.body.entity.description,
            ]
          );
          break;
        case 2: // Vehicle
          entityResult = await client.query(
            `INSERT INTO "Vehicle" (post_id, brand, model, color, plate_number, description)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING *`,
            [
              createdPost.post_id,
              req.body.entity.brand,
              req.body.entity.model,
              req.body.entity.color,
              req.body.entity.plate_number,
              req.body.entity.description,
            ]
          );
          break;
        default:
          throw { kind: "not_found", message: "Category not found" };
      }

      const createdEntity = entityResult.rows[0];

      await client.query("COMMIT"); // Commit transaction

      return { post: createdPost, entity: createdEntity }; // Return the created post and entity
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on error
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  static async getNearbyPosts(req) {
    const category_id = req.query.category_id;
    var category = "";
    // Append category filter if provided
    switch (category_id) {
      case "1": // Animal
        category = `"Animal"`; // Name of the table
        break;
      case "2": // Vehicle
        category = `"Vehicle"`; // Name of the table
        break;
      case "3": // Object
        category = `"Object"`; // Name of the table
        break;
      default:
        category = "Not Found"; // Invalid category
        break;
    }

    // Define the base SQL query with distance calculation
    let query =
      `
    WITH distance_calculated AS (
      SELECT 
          p.*, 
          t.*,
          ( 6371 * acos(
              cos(radians($2)) * cos(radians(p.lost_latitude)) * 
              cos(radians(p.lost_longitude) - radians($1)) + 
              sin(radians($2)) * sin(radians(p.lost_latitude))
          )) AS distance
      FROM Post p
      JOIN ` +
      category +
      ` t ON p.post_id = t.post_id
    )
    SELECT *
    FROM distance_calculated
    WHERE distance <= $3 -- Distance in kilometers
    `;

    const ordered = req.body.ordered;
    // Append ORDER BY clause based on the 'ordered' parameter
    switch (ordered) {
      case "DISTANCE":
        query += " ORDER BY distance ASC";
        break;
      case "DATELOST":
        query += " ORDER BY p.lost_date ASC"; // Adjust column name as needed
        break;
      case "REWARD":
        query += " ORDER BY p.reward DESC"; // Adjust column name as needed
        break;
      default:
        // Default ordering can be by distance if 'ordered' is invalid
        query += " ORDER BY distance ASC";
        break;
    }

    // Define the parameter values in the correct order
    const values = [req.query.longitude, req.query.latitude, req.query.radius];
    // Execute the query with the parameterized values
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  /**
   * Find a post by ID
   * @param {number} post_id - Post ID
   * @returns {Object} Post object
   */
  static async findByPostId(post_id) {
    try {
      // Query for the post
      const queryPost = `SELECT p.* FROM Post p WHERE p.post_id = $1`;
      const resultPost = await db.query(queryPost, [post_id]);

      if (resultPost.rows.length === 0) {
        throw { kind: "not_found", message: "Post not found" };
      }

      const post = resultPost.rows[0];

      // Query for the user associated with the post
      const queryUser = `SELECT user_id, first_name, last_name, is_premium FROM "User" WHERE user_id = $1`;
      const resultUser = await db.query(queryUser, [post.user_id]);

      if (resultUser.rows.length === 0) {
        throw { kind: "not_found", message: "User not found" };
      }

      const user = resultUser.rows[0];

      // Create a combined result object
      const result = {
        post,
        user,
        entity: null,
      };

      // Query for the entity based on the post's category
      switch (post.category_id) {
        case 1:
          const queryAnimal = `SELECT * FROM Animal WHERE post_id = $1`;
          const resultAnimal = await db.query(queryAnimal, [post_id]);
          result.entity = resultAnimal.rows[0] || null;
          break;

        case 2:
          const queryVehicle = `SELECT * FROM Vehicle WHERE post_id = $1`;
          const resultVehicle = await db.query(queryVehicle, [post_id]);
          result.entity = resultVehicle.rows[0] || null;
          break;

        default:
          // No specific entity type, or the category is not handled
          result.entity = null;
          break;
      }
      return result;
    } catch (error) {
      console.error("Error finding post by ID:", error);
      throw error;
    }
  }

  /**
   * Find all posts of a user
   * @param {number} user_id - User ID
   * @returns {Array} Array of Post objects
   */
  static async getAllByUserId(user_id) {
    try {
      const result = await db.query(
        `SELECT * FROM Post
       WHERE Post.user_id = $1`,
        [user_id]
      );

      // Initialize allPosts as an array
      const allPosts = [];

      // Iterate over result rows and add each post to allPosts
      for (const row of result.rows) {
        // Assuming findByPostId is a static method of the same class
        allPosts.push(await this.findByPostId(row.post_id));
      }

      return allPosts;
    } catch (error) {
      console.error("Error finding posts by user ID:", error);
      throw error;
    }
  }

  /**
   * Update a post by ID
   * @param {Object} updatedPost - Updated Post object
   */
  static async updateById(req) {
    const client = await db.connect(); // Start a new transaction
    try {
      await client.query("BEGIN"); // Begin transaction
  
      const updatedPostResult = await client.query(
        `UPDATE Post 
         SET reward = $1, lost_longitude = $2, lost_latitude = $3, lost_date = $4, updated_at = CURRENT_TIMESTAMP
         WHERE post_id = $5
         RETURNING *`,
        [
          req.body.post.reward,
          req.body.post.lost_longitude,
          req.body.post.lost_latitude,
          req.body.post.lost_date,
          req.body.post.post_id,
        ]
      );
  
      if (updatedPostResult.rowCount === 0) {
        throw { kind: "not_found", message: "Post not found" };
      }
  
      let entityResult;
      const category_id = req.body.post.category_id;
  
      switch (category_id) {
        case 1: // Animal
          entityResult = await client.query(
            `UPDATE Animal SET name = $1, gender = $2, type = $3, race = $4, age = $5, description = $6
             WHERE post_id = $7
             RETURNING *`,
            [
              req.body.entity.name,
              req.body.entity.gender,
              req.body.entity.type,
              req.body.entity.race,
              req.body.entity.age,
              req.body.entity.description,
              req.body.post.post_id,
            ]
          );
          break;
        case 2: // Vehicle
          entityResult = await client.query(
            `UPDATE Vehicle SET brand = $1, model = $2, color = $3, plate_number = $4, description = $5
             WHERE post_id = $6
             RETURNING *`,
            [
              req.body.entity.brand,
              req.body.entity.model,
              req.body.entity.color,
              req.body.entity.plate_number,
              req.body.entity.description,
              req.body.post.post_id,
            ]
          );
          break;
        default:
          throw { kind: "not_found", message: "Category not found" };
      }
  
      if (entityResult.rowCount === 0) {
        throw { kind: "not_found", message: "Entity not found for this post" };
      }
  
      const updatedPost = updatedPostResult.rows[0];
      const updatedEntity = entityResult.rows[0];
  
      await client.query("COMMIT"); // Commit transaction
  
      return { post: updatedPost, entity: updatedEntity }; // Return the updated post and entity
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on error
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
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
