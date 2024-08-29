const Post = require("../models/postModel");


exports.getPostById = async (req, res) => {
  try {
    const postId = req.query.post_id;
    const post = await Post.findByPostId(postId);
    if (!post) {
      res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
          details: "The requested post could not be found.",
        },
      });
    } else {
      res.status(200).send(post);
    }
  } catch (error) {
    console.error("Error retrieving post:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving the post.",
        details: error.message,
      },
    });
  }
}
  


/**
 * Create a new Post
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.createPost = async (req, res) => {
  try {
    const result = Post.createPost(req);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while creating the post.",
        details: error.message,
      },
    });
  }
};


exports.getNearbyPosts = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const posts = await Post.getNearbyPosts(req);
    res.status(200).send(posts);
  } catch (err) {
    console.error("Error retrieving nearby posts:", err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_RETRIEVING_NEARBY_POSTS",
        message: "An error occurred while retrieving nearby posts.",
        details: "Please try again later.",
      },
    });
  }
};


exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const posts = await Post.getAllByUserId(userId);
    res.status(200).send(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_FINDING_POSTS",
        message: "An error occurred while finding posts by user ID.",
        details: "Please try again later.",
      },
    });
  }
};


/**
 * Retrieve all Posts
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.getAll();
    res.status(200).send(posts);
  } catch (err) {
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_RETRIEVING_POSTS",
        message: "An error occurred while retrieving posts.",
        details: "Please try again later.",
      },
    });
  }
};

/**
 * Update a Post by ID
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.updatePostById = async (req, res) => {
  try {
    const updatedPost = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      reward: req.body.reward,
      lost_location: req.body.lost_location,
      lost_date: req.body.lost_date,
    };

    const data = await Post.updateById(req.params.post_id, updatedPost);
    res.status(200).send(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
          details: "The requested post could not be found.",
        },
      });
    } else {
      res.status(500).send({
        status: "error",
        statusCode: 500,
        error: {
          code: "ERROR_UPDATING_POST",
          message: "An error occurred while updating the post.",
          details: "Please try again later.",
        },
      });
    }
  }
};

/**
 * Delete a Post by ID
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.deletePostById = async (req, res) => {
  try {
    const postId = req.params.post_id;
    console.log(postId);

    // Fetch the post by ID to verify ownership
    const post = await Post.findByPostId(postId);

    if (!post) {
      return res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
          details: "The requested post could not be found.",
        },
      });
    }

    // Check if the user making the request is the owner of the post
    if (post.user_id !== req.userId) {
      return res.status(403).send({
        status: "error",
        statusCode: 403,
        error: {
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post.",
          details: "You can only delete your own posts.",
        },
      });
    }

    // If authorized, delete the post
    await Post.deleteById(postId);
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "Post deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_DELETING_POST",
        message: "An error occurred while deleting the post.",
        details: "Please try again later.",
      },
    });
  }
};
