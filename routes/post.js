const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Create a new Post
router.post('/', postController.createPost);

// Retrieve a single Post with postId
router.get('/:postId', postController.getPostById);

// Update a Post with postId
router.put('/:postId', postController.updatePost);

// Delete a Post with postId
router.delete('/:postId', postController.deletePost);

module.exports = router;