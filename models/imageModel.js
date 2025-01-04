import db from "../config/db.js";

class Image {
  static async getImage(id) {
    try {
      const result = await db.query(
        `SELECT image_url, created_at FROM "PostImage" WHERE image_id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting image:", error);
      throw error;
    }
  }

  static async getImages(post_id) {
    try {
      const result = await db.query(
        `SELECT image_url, created_at FROM "PostImage" WHERE post_id = $1`,
        [post_id]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting images:", error);
      throw error;
    }
  }

  static async createImage(image, post_id) {
    try {
      const result = await db.query(
        `INSERT INTO "PostImage" (post_id, image_url)
                 VALUES ($1, $2)
                 RETURNING *`,
        [
          post_id,
          image
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating image:", error);
      throw error;
    }
  }

}

export default Image;