import db from "../config/db.js";

class Post {
  static async getPost(id) {
    try {
      const query = `
        SELECT * FROM "Post"
        WHERE id = $1 AND status = 'OPEN'
      `;
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Post with ID ${id} not found or is not open.`);
      }

      // Return the first row from the result
      return result.rows[0];
    } catch (error) {
      console.error("Error getting post:", error.message);
      throw new Error("Error retrieving the post.");
    }
  }

  static async getPosts(user_id) {
    try {
      const query = `
        SELECT * FROM "Post"
        WHERE user_id = $1 AND post_status = 'OPEN'
      `;
      const result = await db.query(query, [user_id]);

      // Check if any posts were found
      if (result.rows.length === 0) {
        console.warn(`No open posts found for user with ID ${user_id}.`);
      }

      return result.rows;
    } catch (error) {
      console.error("Error getting posts:", error.message);
      throw new Error("Error retrieving posts for the user.");
    }
  }

  static async getNearbyPosts(longitude, latitude, radius, status, category) {
    try {
      // Base query with distance calculation
      let query = `
        WITH distance_calculated AS (
          SELECT 
            l.*, 
            p.*,
            ( 6371 * acos(
              cos(radians($2)) * cos(radians(l.latitude)) * 
              cos(radians(l.longitude) - radians($1)) + 
              sin(radians($2)) * sin(radians(l.latitude))
            )) AS distance
          FROM "Post" p
          JOIN "Location" l ON l.location_id = p.location_id
        )
        SELECT * FROM distance_calculated
        WHERE distance <= $3 AND post_status = 'OPEN'
      `;

      // Initialize parameters
      const params = [longitude, latitude, radius];
      let paramIndex = 4;

      // Add conditions based on type and category if they are provided
      if (status) {
        query += ` AND item_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (category) {
        query += ` AND category_id = $${paramIndex}`;
        params.push(category);
      }

      // Execute the query with the parameters
      const result = await db.query(query, params);

      // Map the result to the desired format
      const posts = result.rows.map((row) => ({
        post: {
          id: row.id,
          user_id: row.user_id,
          category_id: row.category_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          reward: row.reward,
          lost_date: row.lost_date,
          found_date: row.found_date,
          is_visible: row.is_visible,
          item_status: row.item_status,
          status: row.status,
          views_count: row.views_count,
          closed_at: row.closed_at,
        },
        location: {
          location_id: row.location_id,
          longitude: row.longitude,
          latitude: row.latitude,
          address: row.address,
          city: row.city,
          state: row.state,
          country: row.country,
          postal_code: row.postal_code,
        },
        distance: row.distance,
      }));

      return posts;
    } catch (error) {
      console.error("Error getting nearby posts:", error);
      throw new Error("Error retrieving nearby posts");
    }
  }

  static async createPost(post, user_id, location_id) {
    const { category_id, reward, lost_date, item_status } = post;

    try {
      const query = `
        INSERT INTO "Post" (
          user_id, category_id, reward, lost_date, location_id, item_status, post_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [
        user_id,
        category_id,
        reward,
        lost_date,
        location_id,
        item_status,
        'OPEN' // Set default post status to 'OPEN'
      ];

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Post creation failed, no post returned.');
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error creating post:", error.message);
      throw new Error('Error creating the post.');
    }
  }

  static async updateLostItem(lostItem) {
    try {
      const result = await db.query(
        `UPDATE "LostItem" SET title = $1, description = $2, location = $3, date = $4, category = $5 WHERE lost_item_id = $6 RETURNING lost_item_id`,
        [
          lostItem.title,
          lostItem.description,
          lostItem.location,
          lostItem.date,
          lostItem.category,
          lostItem.lost_item_id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating lost item:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = `
        UPDATE "Post"
        SET status = 'DELETED'
        WHERE id = $1
        RETURNING *  -- Return the updated post to confirm the change
      `;

      const result = await db.query(query, [id]);

      // Check if any rows were affected
      if (result.rowCount === 0) {
        throw new Error(`Post with ID ${id} not found or already deleted.`);
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error deleting post:", error.message);
      throw new Error('Error deleting the post.');
    }
  }
}

export default Post;
