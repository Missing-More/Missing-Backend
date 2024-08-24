const Post = require("../models/postModel");

// Create and Save a new Post
exports.createPost = async (req, res) => {
  try {
    // Create a Post object
    const post = {
      user_id: req.userId, // The user ID is obtained from the verified token
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      reward: req.body.reward,
      lost_longitude: req.body.lost_longitude,
      lost_latitude: req.body.lost_latitude,
      lost_date: req.body.lost_date,
    };

    // Save Post in the database
    const data = await Post.create(post);
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

// Retrieve all Posts from the database
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

// Find a single Post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
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

// Find all Posts nearby
exports.getNearbyPosts = async (req, res) => {
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

    const posts = await Post.findByNearby(longitude, latitude, radius);
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

// Update a Post by ID
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

// Delete a Post by ID
exports.deletePostById = async (req, res) => {
  try {
    const data = await Post.deleteById(req.params.post_id);
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "Post deleted successfully.",
      data: data,
    });
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
          code: "ERROR_DELETING_POST",
          message: "An error occurred while deleting the post.",
          details: "Please try again later.",
        },
      });
    }
  }
};
