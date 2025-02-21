import User from "../../../models/userModel.js";
import Animal from "../../../models/animalModel.js";
import Vehicle from "../../../models/vehicleModel.js";
import Post from "../../../models/postModel.js";
import Location from "../../../models/locationModel.js";
import Image from "../../../models/imageModel.js";


export async function getPostController(req, res) {
  try {
    const postId = req.params.postId;
    console.log("BON")

    if (!postId) {
      return res.status(400).json({
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
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
        },
      });
    }

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

    res.status(200).json({
      data: {
        post: {
          created_at: post.created_at,
          updated_at: post.updated_at,
          reward: post.reward,
          lost_date: post.lost_date,
          found_date: post.found_date,
          is_visible: post.is_visible,
          item_status: post.item_status,
          post_status: post.post_status,
          views_count: post.views_count,
          closed_at: post.closed_at,
          images: await Image.getImages(postId),
          entity,
          location: await Location.getLocation(post.location_id),
          user,
        },
      }
    });
  } catch (error) {
    console.error("Error retrieving Post:", error);
    res.status(500).json({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving the Post.",
        details: error.message,
      },
    });
  }
}

export async function getUserPostsController(req, res) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        error: {
          code: "INVALID_PARAMETER",
          message: "User ID is required.",
        },
      });
    }

    // Initialize the response structure
    let data = {
      "data": {
        "posts": []  // This is an array that will hold all the posts data
      }
    };

    // Fetch posts for the user
    const posts = await Post.getPosts(userId);

    // Process all posts
    const results = await Promise.all(
      posts.map(async (post) => {
        // Create postData object to hold the current post's data
        let postData = {
            created_at: post.created_at,
            updated_at: post.updated_at,
            reward: post.reward,
            lost_date: post.lost_date,
            found_date: post.found_date,
            is_visible: post.is_visible,
            item_status: post.item_status,
            post_status: post.post_status,
            views_count: post.views_count,
            closed_at: post.closed_at,
            "images": [] 
        };

        // Add images for the current post
        postData.images = await Image.getImages(post.post_id);


        // Add category-related data based on category_id
        switch (post.category_id) {
          case 1:  // Animal category
            postData.entity = await Animal.getAnimal(post.post_id);
            break;
          case 2:  // Vehicle category
            postData.entity = await Vehicle.getVehicle(post.post_id);
            break;
          default:
            break;
        }
        postData.location = await Location.getLocation(post.location_id);
        // Push the complete post data into the posts array
        data.data.posts.push(postData);
      })
    );

    // Return the final data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while retrieving posts.",
        details: error.message,
      },
    });
  }
}


export async function createPostController(req, res) {
  try {
    const userId = req.userId;
    const { location, post, images, entity } = req.body;

    if (!userId || !post || !location) {
      return res.status(400).json({
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

    res.status(201).json({
      post: createdPost,
      images: createdImages,
      location: createdLocation,
      entity: createdEntity,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while creating the post.",
        details: error.message,
      },
    });
  }
}

export async function getNearbyPostsController(req, res) {
  const { longitude, latitude, radius, status, category_id } = req.query;

  if (!longitude || !latitude || !radius) {
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      error: {
        code: "INVALID_PARAMETERS",
        message: "Longitude, latitude, and radius are required.",
      },
    });
  }

  try {
    const posts = await Post.getNearbyPosts(longitude, latitude, radius, status, category_id);

    const results = await Promise.all(
      posts.map(async (post) => {
        const images = await Image.getImages(post.post.post_id);
        let entity = null;
        switch (post.post.category_id) {
          case 1:
            entity = await Animal.getAnimal(post.post.post_id);
            break;
          case 2:
            entity = await Vehicle.getVehicle(post.post.post_id);
            break;
          default:
            break;
        }

        const user = await User.getUser(post.post.user_id);

        return {
          post: post.post,
          images,
          location: post.location,
          entity,
          user,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error retrieving nearby posts:", error);
    res.status(500).json({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving nearby posts.",
        details: error.message,
      },
    });
  }
}

/*export async function updatePostController(req, res) {
  try {
    const data = await Listing.updateById(req);

    res.status(200).json(data);
  } catch (error) {
    if (error.kind === "not_found") {
      res.status(404).json({
        status: "error",
        statusCode: 404,
        error: {
          code: "LISTING_NOT_FOUND",
          message: "Listing not found.",
        },
      });
    } else {
      console.error("Error updating listing:", error);
      res.status(500).json({
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
}*/

export async function deletePostController(req, res) {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({
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
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
        },
      });
    }

    if (post.user_id !== req.userId) {
      return res.status(403).json({
        status: "error",
        statusCode: 403,
        error: {
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post.",
        },
      });
    }

    await Post.deletePost(postId);

    res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while deleting the post.",
        details: error.message,
      },
    });
  }
}
