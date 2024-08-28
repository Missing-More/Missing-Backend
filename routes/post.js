const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middlewares/verifyToken");


router.post("/createPost", verifyToken, postController.createPost);

router.get("/getNearbyPosts", postController.getNearbyPosts);


/**
 * @route POST /posts/deletePostById
 * @group Post - Operations about post
 * @param {number} postId.body.required - Post ID
 * @returns {object} 200 - Post deleted successfully
 * @returns {Error}  default - Unexpected error
 */
router.post("/deletePostById", verifyToken, postController.deletePostById);

/**
 * @route GET /posts/allPosts
 * @group Post - Operations about post
 * @returns {object} 200 - Posts retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get("/allPosts", postController.getAllPosts);

/**
 * @route GET /posts/getMyPosts
 * @group Post - Operations about post
 * @returns {object} 200 - Posts retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get("/getMyPosts", verifyToken, postController.getMyPosts);


/**
 * @route GET /posts/getPostById
 * @group Post - Operations about post
 * @param {number} postId.query.required - Post ID
 * @returns {object} 200 - Post retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
//router.get("/getPostById", postController.getPostById);

// Update a Post with postId
//router.put('/:postId', postController.updatePost);

module.exports = router;
