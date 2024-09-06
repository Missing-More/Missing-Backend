const db = require("../config/db");

class FoundItem {
    static async getFoundItem(id) {
        try {
        const result = await db.query(
            `SELECT * FROM "FoundItem" WHERE found_item_id = $1`,
            [id]
        );
        return result.rows[0];
        } catch (error) {
        console.error("Error getting found item:", error);
        throw error;
        }
    }
    
    static async getFoundItems(user_id) {
        try {
        const result = await db.query(
            `SELECT * FROM "FoundItem" WHERE user_id = $1`,
            [user_id]
        );
        return result.rows;
        } catch (error) {
        console.error("Error getting found items:", error);
        throw error;
        }
    }
    
    static async createFoundItem(foundItem) {
        try {
        const result = await db.query(
            `INSERT INTO "FoundItem" (user_id, category_id, reward, found_date, location_id, status)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING *`,
            [
            foundItem.user_id,
            foundItem.category_id,
            foundItem.reward,
            foundItem.found_date,
            foundItem.location_id,
            foundItem.status,
            ]
        );
        return result.rows[0];
        }
        catch (error) {
        console.error("Error creating found item:", error);
        throw error;
        }
    }
}

module.exports = FoundItem;