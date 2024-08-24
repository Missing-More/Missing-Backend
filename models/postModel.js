const mysql = require('mysql');
const dbConfig = require('../config/db');

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

// Post model
class Post {
    constructor(id, title, content, authorId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId;
    }

    static create(newPost, result) {
        connection.query("INSERT INTO posts SET ?", newPos        const mysql = require('mysql');
        const dbConfig = require('../config/db');
        
        // Create a connection to the database
        const connection = mysql.createConnection(dbConfig);
        
        // Connect to the database
        connection.connect(error => {
            if (error) throw error;
            console.log("Successfully connected to the database.");
        });
        
        // Post model
        class Post {
            constructor(post_id, user_id, title, description, category, created_at, updated_at, reward, lost_location, lost_date) {
                this.post_id = post_id;
                this.user_id = user_id;
                this.title = title;
                this.description = description;
                this.category = category;
                this.created_at = created_at;
                this.updated_at = updated_at;
                this.reward = reward;
                this.lost_location = lost_location;
                this.lost_date = lost_date;
            }
        
            static create(newPost, result) {
                connection.query("INSERT INTO Post SET ?", newPost, (error, res) => {
                    if (error) {
                        console.log("error: ", error);
                        result(error, null);
                        return;
                    }
        
                    console.log("created post: ", { post_id: res.insertId, ...newPost });
                    result(null, { post_id: res.insertId, ...newPost });
                });
            }
        
            static findById(postId, result) {
                connection.query(`SELECT * FROM Post WHERE post_id = ${postId}`, (error, res) => {
                    if (error) {
                        console.log("error: ", error);
                        result(error, null);
                        return;
                    }
        
                    if (res.length) {
                        console.log("found post: ", res[0]);
                        result(null, res[0]);
                        return;
                    }
        
                    // No post found with the id
                    result({ kind: "not_found" }, null);
                });
            }
        }
        
        module.exports = Post;t, (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(error, null);
                return;
            }

            console.log("created post: ", { id: res.insertId, ...newPost });
            result(null, { id: res.insertId, ...newPost });
        });
    }

    static findById(postId, result) {
        connection.query(`SELECT * FROM posts WHERE id = ${postId}`, (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(error, null);
                return;
            }

            if (res.length) {
                console.log("found post: ", res[0]);
                result(null, res[0]);
                return;
            }

            // not found Post with the id
            result({ kind: "not_found" }, null);
        });
    }

    static getAll(result) {
        connection.query("SELECT * FROM posts", (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(null, error);
                return;
            }

            console.log("posts: ", res);
            result(null, res);
        });
    }

    static updateById(id, post, result) {
        connection.query(
            "UPDATE posts SET title = ?, content = ?, authorId = ? WHERE id = ?",
            [post.title, post.content, post.authorId, id],
            (error, res) => {
                if (error) {
                    console.log("error: ", error);
                    result(null, error);
                    return;
                }

                if (res.affectedRows == 0) {
                    // not found Post with the id
                    result({ kind: "not_found" }, null);
                    return;
                }

                console.log("updated post: ", { id: id, ...post });
                result(null, { id: id, ...post });
            }
        );
    }

    static remove(id, result) {
        connection.query("DELETE FROM posts WHERE id = ?", id, (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(null, error);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Post with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("deleted post with id: ", id);
            result(null, res);
        });
    }

    static removeAll(result) {
        connection.query("DELETE FROM posts", (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(null, error);
                return;
            }

            console.log(`deleted ${res.affectedRows} posts`);
            result(null, res);
        });
    }
}

module.exports = Post;