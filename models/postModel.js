const db = require("../config/db");

class Post {
  static async getPost(item_id) {
    try {
      const result = await db.query(
        `SELECT * FROM "Post" WHERE id = $1`,
        [item_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting lost item:", error);
      throw error;
    }
  }

  static async getPosts(user_id) {
    try {
      const result = await db.query(
        `SELECT * FROM "Post" WHERE user_id = $1`,
        [user_id]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting lost items:", error);
      throw error;
    }
  }

  static async getNearbyPosts(longitude, latitude, radius) {
    try {
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
      FROM "Location" l 
      JOIN "Post" p ON l.location_id = p.location_id
      )
      SELECT * FROM distance_calculated WHERE distance <= $3`;

      const result = await db.query(query, [longitude, latitude, radius]);

      const posts = result.rows.map(row => ({
        post: {
          post_id: row.id,
          user_id: row.user_id,
          category_id: row.category_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          reward: row.reward,
          lost_date: row.lost_date,
          found_date: row.found_date,
          is_visible: row.is_visible,
          status: row.status,
          views_count: row.views_count,
          closed_at: row.closed_at
        },
        location: {
          location_id: row.location_id,
          longitude: row.longitude,
          latitude: row.latitude,
          address: row.address,
          city: row.city,
          state: row.state,
          country: row.country,
          postal_code: row.postal_code
        },
        distance: row.distance
      }));

      return posts;
    } catch (error) {
      console.error("Error getting nearby posts:", error);
      throw error;
    }

  }

  static async createPost(item, user_id, location_id) {
    try {
      const result = await db.query(
        `INSERT INTO "Post" (user_id, category_id, reward, lost_date, location_id, status)
                       VALUES ($1, $2, $3, $4, $5, $6)
                       RETURNING *`,
        [
          user_id,
          item.category_id,
          item.reward,
          item.lost_date,
          location_id,
          "REPORTED",
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating lost item:", error);
      throw error;
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

  static async deleteLostItem(id) {
    try {
      const result = await db.query(
        `DELETE FROM "LostItem" WHERE lost_item_id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting lost item:", error);
      throw error;
    }
  }
}

module.exports = Post;