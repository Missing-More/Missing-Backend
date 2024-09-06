const db = require("../config/db");

class Animal {
  static async getAnimal(id) {
    try {
      const result = await db.query(
        `SELECT * FROM "Animal" WHERE animal_id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting animal:", error);
      throw error;
    }
  }

  static async getAnimalByPostId(post_id) {
    try {
      const result = await db.query(
        `SELECT * FROM "Animal" WHERE lost_item_id = $1 OR found_item_id = $1`,
        [post_id]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting animal:", error);
      throw error;
    }
  }

  static async createAnimal(animal, post_id) {
    console.log(animal);
    try {
      const result = await db.query(
        `INSERT INTO "Animal" (post_id, name, gender, type, race, age, description)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
        [
          post_id,
          animal.name,
          animal.gender,
          animal.type,
          animal.race,
          animal.age,
          animal.description,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating animal:", error);
      throw error;
    }
  }

}

module.exports = Animal;
