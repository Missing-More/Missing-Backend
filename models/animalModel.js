const db = require("../config/db");

class Animal {


  static async getPostsByUserId(userId) {
    const query = `
                SELECT p.*, a.*
                FROM Post p
                JOIN Animal a ON p.post_id = a.post_id
                WHERE p.user_id = $1
            `;

    const { rows } = await db.query(query, [userId]);
    return rows;
  }



  static async getPostById(postId) {
    const query = `
                SELECT p.*, a.*
                FROM Post p
                JOIN Animal a ON p.post_id = a.post_id
                WHERE p.post_id = $1
            `;

    const { rows } = await db.query(query, [postId]);
    return rows[0];
  }
}

module.exports = Animal;
