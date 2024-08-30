const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @route GET /posts/getPostById
 * @param {number} postId.query.required - Post ID
 */
router.get("/getPostById", postController.getPostById);

/**
 * @route GET /posts/getMyPosts
 * @param {number} userId.query.required
 */
router.get("/getMyPosts", verifyToken, postController.getMyPosts);

/**
 * @route POST /posts/createPost
 * @param {string} title.body.required - Title
 * @param {string} description.body.required - Description
 */
router.post("/createPost", verifyToken, postController.createPost);

/**
 * @route POST /posts/getNearbyPosts
 * @param {number} longitude.body.required - Longitude
 * @param {number} latitude.body.required - Latitude
 * @param {number} radius.body.required - Radius
 * @param {number} category_id.body.required - Category
 */
router.get("/getNearbyPosts", postController.getNearbyPosts);

/**
 * @route POST /posts/deletePostById
 * @param {number} postId.body.required - Post ID
 */
router.post("/deletePostById", verifyToken, postController.deletePostById);

/**
 * @route POST /posts/updatePostById
 * @param {number} postId.body.required - Post ID
 */
router.post("/updatePostById", verifyToken, postController.updatePostById);

/**
 * @route GET /posts/allPosts
 * @group Post - Operations about post
 * @returns {object} 200 - Posts retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get("/allPosts", postController.getAllPosts);

module.exports = router;
