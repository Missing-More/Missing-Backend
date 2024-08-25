const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @route POST /posts/createAnimalPost
 * @group Post - Operations about post
 * @param {string} name.body.required - Animal's name
 * @param {string} age.body.required - Animal's age
 * @param {string} gender.body.required - Animal's gender
 * @param {number} reward.body.required - Post's reward
 * @param {number} type.body.required - Animal's type
 * @param {number} race.body.required - 
 * @param {number} description.body.required - Post's lost longitude
 * @param {number} lost_latitude.body.required - Post's lost latitude
 * @param {number} lost_longitude.body.required - Post's lost latitude
 * @param {string} lost_date.body.required - Post's lost date
 * @param {string} images.required - Post's lost date
 * @returns {object} 200 - Post created successfully
 * @returns {Error}  default - Unexpected error
 */
router.post("/createAnimalPost", verifyToken, postController.createAnimalPost);

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
 * @route GET /posts/getPostByNearbyOrderedByDistance
 * @group Post - Operations about post
 * @param {number} longitude.query.required - Longitude
 * @param {number} latitude.query.required - Latitude
 * @param {number} radius.query.required - Radius
 * @returns {object} 200 - Posts retrieved successfully
 * @returns {Error}  default - Unexpected error
 *
 */
router.get(
  "/getPostByNearbyOrderedByDistance",
  postController.getNearbyPostsOrderedByDistance
);

/**
 * @route GET /posts/getPostByNearbyOrderedByReward
 * @group Post - Operations about post
 * @param {number} longitude.query.required - Longitude
 * @param {number} latitude.query.required - Latitude
 * @param {number} radius.query.required - Radius
 * @returns {object} 200 - Posts retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get(
  "/getPostByNearbyOrderedByReward",
  postController.getNearbyPostsOrderedByReward
);

/**
 * @route GET /posts/getPostByNearbyOrderedByDatePosted
 * @group Post - Operations about post
 * @param {number} longitude.query.required - Longitude
 * @param {number} latitude.query.required - Latitude
 * @param {number} radius.query.required - Radius
 * @returns {object} 200 - Posts retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get(
  "/getPostByNearbyOrderedByDatePosted",
  postController.getNearbyPostsOrderedByDatePosted
);

/**
 * @route GET /posts/getPostById
 * @group Post - Operations about post
 * @param {number} postId.query.required - Post ID
 * @returns {object} 200 - Post retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get("/getPostById", postController.getPostById);

// Update a Post with postId
//router.put('/:postId', postController.updatePost);


module.exports = router;
