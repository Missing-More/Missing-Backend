const db = require("../config/db");

class LostItem {
  static async getLostItem(item_id) {
    try {
      const result = await db.query(
        `SELECT * FROM "LostItem" WHERE lost_item_id = $1`,
        [item_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting lost item:", error);
      throw error;
    }
  }

  static async getLostItems(user_id) {
    try {
      const result = await db.query(
        `SELECT * FROM "LostItem" WHERE user_id = $1`,
        [user_id]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting lost items:", error);
      throw error;
    }
  }

  static async createLostItem(lostItem) {
    try {
      const result = await client.query(
        `INSERT INTO "LostItem" (user_id, category_id, reward, lost_date, location_id, status)
                       VALUES ($1, $2, $3, $4, $5, $6)
                       RETURNING *`,
        [
          req.userId,
          req.body.listing.category_id,
          req.body.listing.reward,
          req.body.listing.lost_date,
          createdLocationID,
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

module.exports = LostItem;