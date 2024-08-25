const Post = require("../models/postModel");

/**
 * Create a new Post
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.createAnimalPost = async (req, res) => {
  try {
    // Create a Post object
    const post = {
      user_id: req.userId,
      reward: req.body.reward,
      lost_longitude: req.body.lost_longitude,
      lost_latitude: req.body.lost_latitude,
      lost_date: req.body.lost_date,
    };
    // Create a Animal object
    const animal = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      type: req.body.type,
      race: req.body.race,
      description: req.body.description,
    };

    //Create post in database
    const data = await Post.createAnimalPost(post, animal);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_CREATING_POST",
        message: "An error occurred while creating the post.",
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
 * Retrieve a single Post by ID
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.query.postId);
    console.log(post);
    res.status(200).send(post);
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
          code: "ERROR_RETRIEVING_POST",
          message: "An error occurred while retrieving the post.",
          details: "Please try again later.",
        },
      });
    }
  }
};

/**
 * Retrieve all Posts nearby ordered by distance
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.getNearbyPostsOrderedByDistance = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    console.log(req.query);
    if (!longitude || !latitude || !radius) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_QUERY",
          message: "Latitude, longitude, and radius are required.",
          details:
            "Please provide valid latitude, longitude, and radius to search for nearby posts.",
        },
      });
    }
    const posts = await Post.findByNearbyOrderedByDistance(
      longitude,
      latitude,
      radius
    );
    res.status(200).send(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_FINDING_POSTS",
        message: "An error occurred while finding nearby posts.",
        details: "Please try again later.",
      },
    });
  }
};

/**
 * Retrieve all Posts nearby ordered by reward
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.getNearbyPostsOrderedByReward = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    console.log(req.query);
    if (!longitude || !latitude || !radius) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_QUERY",
          message: "Latitude, longitude, and radius are required.",
          details:
            "Please provide valid latitude, longitude, and radius to search for nearby posts.",
        },
      });
    }
    const posts = await Post.findByNearbyOrderedByReward(
      longitude,
      latitude,
      radius
    );
    res.status(200).send(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_FINDING_POSTS",
        message: "An error occurred while finding nearby posts.",
        details: "Please try again later.",
      },
    });
  }
};

/**
 * Retrieve all Posts nearby ordered by date posted
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.getNearbyPostsOrderedByDatePosted = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    console.log(req.query);
    if (!longitude || !latitude || !radius) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_QUERY",
          message: "Latitude, longitude, and radius are required.",
          details:
            "Please provide valid latitude, longitude, and radius to search for nearby posts.",
        },
      });
    }
    const posts = await Post.findByNearbyOrderedByDatePosted(
      longitude,
      latitude,
      radius
    );
    res.status(200).send(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_FINDING_POSTS",
        message: "An error occurred while finding nearby posts.",
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
    const post = await Post.findById(postId);

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
