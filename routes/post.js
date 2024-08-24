const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const verifyToken = require('../middlewares/verifyToken');

// Create a new Post
router.post('/createPost', verifyToken, postController.createPost);

// Retrieve all Posts
router.get('/allPosts', postController.getAllPosts);

// Retrieve all bost nearby
router.get('/nearbyPosts', postController.getNearbyPosts);

// Retrieve a single Post with postId
//router.get('/:postId', postController.getPostById);

// Update a Post with postId
//router.put('/:postId', postController.updatePost);

// Delete a Post with postId
//router.delete('/:postId', postController.deletePost);

module.exports = router;