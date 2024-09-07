const Listing = require("../../../models/listingModel");
const User = require("../../../models/userModel");
const Animal = require("../../../models/animalModel");
const Vehicle = require("../../../models/vehicleModel");
const Post = require("../../../models/postModel");
const Location = require("../../../models/locationModel");
const Image = require("../../../models/imageModel");

exports.getPost = async (req, res) => {
  try {
    const postId = req.query.post_id;

    if (!postId) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_PARAMETER",
          message: "Post ID is required.",
        },
      });
    }

    const post = await Post.getPost(postId);

    if (!post) {
      return res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
        },
      });
    }

    const images = await Image.getImages(postId);

    let entity = null;
    switch (post.category_id) {
      case 1:
        entity = await Animal.getAnimal(postId);
        break;
      case 2:
        entity = await Vehicle.getVehicle(postId);
        break;
      default:
        break;
    }

    const user = post.user_id ? await User.getUser(post.user_id) : null;

    res.status(200).send({
      post,
      images,
      entity,
      user,
    });
  } catch (error) {
    console.error("Error retrieving Post:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving the Post.",
        details: error.message,
      },
    });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_PARAMETER",
          message: "User ID is required.",
        },
      });
    }

    const posts = await Post.getPosts(userId);

    const results = await Promise.all(
      posts.map(async (post) => {
        const images = await Image.getImages(post.post_id);
        let entity = null;

        switch (post.category_id) {
          case 1:
            entity = await Animal.getAnimal(post.post_id);
            break;
          case 2:
            entity = await Vehicle.getVehicle(post.post_id);
            break;
          default:
            break;
        }

        return {
          post,
          images,
          entity,
          user: await User.getUser(userId),
        };
      })
    );

    res.status(200).send(results);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while retrieving posts.",
        details: error.message,
      },
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { location, post, images, entity } = req.body;

    if (!userId || !post || !location) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_INPUT",
          message: "User ID, post data, and location are required.",
        },
      });
    }

    const createdLocation = await Location.createLocation(location);
    const createdPost = await Post.createPost(post, userId, createdLocation.location_id);
    const postId = createdPost.post_id;

    const createdImages = await Promise.all(
      images.map(image => Image.createImage(image, postId))
    );

    let createdEntity = null;
    if (post.category_id === 1) {
      createdEntity = await Animal.createAnimal(entity, postId);
    } else if (post.category_id === 2) {
      createdEntity = await Vehicle.createVehicle(entity, postId);
    }

    res.status(201).send({
      post: createdPost,
      images: createdImages,
      location: createdLocation,
      entity: createdEntity,
    });
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
  const { longitude, latitude, radius, type, category_id } = req.query;

  if (!longitude || !latitude || !radius) {
    return res.status(400).send({
      status: "error",
      statusCode: 400,
      error: {
        code: "INVALID_PARAMETERS",
        message: "Longitude, latitude, and radius are required.",
      },
    });
  }

  try {
    const posts = await Post.getNearbyPosts(longitude, latitude, radius, type, category_id);

    const results = await Promise.all(
      posts.map(async (post) => {
        const images = await Image.getImages(post.post.post_id);
        let entity = null;

        switch (post.category_id) {
          case 1:
            entity = await Animal.getAnimal(post.post.post_id);
            break;
          case 2:
            entity = await Vehicle.getVehicle(post.post.post_id);
            break;
          default:
            break;
        }

        const user = await User.getUser(post.user_id);

        return {
          post: post.post,
          images: images,
          location: post.location,
          entity: entity,
          user: user,
        };
      })
    );

    res.status(200).send(results);
  } catch (error) {
    console.error("Error retrieving nearby posts:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving nearby posts.",
        details: error.message,
      },
    });
  }
};

exports.updateListingById = async (req, res) => {
  try {
    const data = await Listing.updateById(req);

    res.status(200).send(data);
  } catch (error) {
    if (error.kind === "not_found") {
      res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "LISTING_NOT_FOUND",
          message: "Listing not found.",
        },
      });
    } else {
      console.error("Error updating listing:", error);
      res.status(500).send({
        status: "error",
        statusCode: 500,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while updating the listing.",
          details: error.message,
        },
      });
    }
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.query.post_id;

    if (!postId) {
      return res.status(400).send({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_PARAMETER",
          message: "Post ID is required.",
        },
      });
    }

    const post = await Post.getPost(postId);

    if (!post) {
      return res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
        },
      });
    }

    if (post.user_id !== req.userId) {
      return res.status(403).send({
        status: "error",
        statusCode: 403,
        error: {
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post.",
        },
      });
    }

    await Post.delete(postId);

    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while deleting the post.",
        details: error.message,
      },
    });
  }
};
