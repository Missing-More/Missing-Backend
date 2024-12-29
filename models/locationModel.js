import db from "../config/db.js";

class Location {
  static async getLocation(id) {
    try {
      const result = await db.query(
        `SELECT * FROM "Location" WHERE location_id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting location:", error);
      throw error;
    }
  }

  static async createLocation(location) {
    try {
      const result = await db.query(
        `INSERT INTO "Location" (longitude, latitude, address, city, state, country, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          location.longitude,
          location.latitude,
          location.address || null,
          location.city || null,
          location.state || null,
          location.country || null,
          location.postal_code || null,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  }

  static async updateLocation(location) {
    try {
      const result = await db.query(
        `UPDATE "Location" SET name = $1, address = $2, city = $3, state = $4, zip_code = $5, country = $6 WHERE location_id = $7 RETURNING location_id`,
        [
          location.location.lost_longitude,
          location.location.lost_latitude,
          location.location.address || null,
          location.location.city || null,
          location.location.state || null,
          location.location.country || null,
          location.location.postal_code || null,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }

  static async deleteLocation(id) {
    try {
      const result = await db.query(
        `DELETE FROM "Location" WHERE location_id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }
}

export default Location;
