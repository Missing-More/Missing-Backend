const Listing = require("../../../models/listingModel");
const User = require("../../../models/userModel");
//const LostItem = require("../../../models/lostItemModel");
//const FoundItem = require("../../../models/foundItemModel");
const Animal = require("../../../models/animalModel");
const Vehicle = require("../../../models/vehicleModel");
const Post = require("../../../models/postModel");
const Location = require("../../../models/locationModel");

exports.getPost = async (req, res) => {
  try {
    const post_id = req.query.post_id;
    const post = await Post.getPost(post_id);

    if (!post) {
      return res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found.",
          details: "The requested Post could not be found.",
        },
      });
    }

    // Retrieve the entity based on the category
    let entity = null;
    switch (post.category_id) {
      case "1":
        entity = await Animal.getAnimal(post.post_id);
        break;
      case "2":
        entity = await Vehicle.getVehicle(post.post_id);
        break;
      default:
        break;
    }
    const userId = post.user_id;

    // Retrieve user information
    const user = userId ? await User.getUser(userId) : null;

    // Respond with the listing and user information
    const result = {
      post: post,
      entity: entity,
      user: user,
    };

    res.status(200).send(result);
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
    const posts = await Post.getPosts(userId);
    
    // Use map to handle each post and await Promise.all to process them concurrently
    const results = await Promise.all(posts.map(async (post) => {
      // Retrieve the entity based on the category
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

      // Retrieve user information (assuming it is the same user for all posts)
      const user = userId ? await User.getUser(userId) : null;

      // Respond with the listing and user information
      return {
        post: post,
        entity: entity,
        user: user,
      };
    }));

    res.status(200).send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_FINDING_LISTINGS",
        message: "An error occurred while finding Listings by user ID.",
        details: "Please try again later.",
      },
    });
  }
};


exports.createPost = async (req, res) => {
  try {
    const user_id = req.userId;
    //create location
    const createdLocation = await Location.createLocation(req.body.location);
    const createdLocationID = createdLocation.location_id;

    //create post
    const createdPost = await Post.createPost(
      req.body.post,
      user_id,
      createdLocationID
    );
    const createdPostID = createdPost.post_id;

    //create entity
    let createdEntity = null;
    console.log(req.body.post);
    switch (req.body.post.category_id) {
      case 1:
        createdEntity = await Animal.createAnimal(
          req.body.entity,
          createdPostID
        );
        break;
      case 2:
        createdEntity = await Vehicle.createVehicle(
          req.body.entity,
          createdPostID
        );
        break;
      default:
        break;
    }

    // Respond with the created post
    const result = {
      post: createdPost,
      location: createdLocation,
      entity: createdEntity,
    };

    res.status(200).send(result);
  } catch (error) {
    console.error("Error creating Listing:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while creating the Listing.",
        details: error.message,
      },
    });
  }
};

exports.getNearbyPosts = async (req, res) => {
  if (req.query.longitude == null || req.query.latitude == null || req.query.radius == null) {
    return res.status(400).send({
      status: "error",
      statusCode: 400,
      error: {
        code: "INVALID_PARAMETERS",
        message: "Invalid parameters.",
        details: "Please provide longitude, latitude, and radius.",
      },
    });
  }

  try {
    const posts = await Post.getNearbyPosts(req.query.longitude, req.query.latitude, req.query.radius);
    
    res.status(200).send(posts);
  } catch (err) {
    console.error("Error retrieving nearby posts:", err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_RETRIEVING_NEARBY_ListingS",
        message: "An error occurred while retrieving nearby Listings.",
        details: "Please try again later.",
      },
    });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const Listings = await Listing.getAll();
    res.status(200).send(Listings);
  } catch (err) {
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_RETRIEVING_ListingS",
        message: "An error occurred while retrieving Listings.",
        details: "Please try again later.",
      },
    });
  }
};

exports.updateListingById = async (req, res) => {
  try {
    /*const updatedListing = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      reward: req.body.reward,
      lost_location: req.body.lost_location,
      lost_date: req.body.lost_date,
    };*/

    const data = await Listing.updateById(req);
    res.status(200).send(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "Listing_NOT_FOUND",
          message: "Listing not found.",
          details: "The requested Listing could not be found.",
        },
      });
    } else {
      res.status(500).send({
        status: "error",
        statusCode: 500,
        error: {
          code: "ERROR_UPDATING_Listing",
          message: "An error occurred while updating the Listing.",
          details: "Please try again later.",
        },
      });
    }
  }
};

/**
 * Delete a Listing by ID
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.deleteListingById = async (req, res) => {
  try {
    const ListingId = req.params.Listing_id;

    // Fetch the Listing by ID to verify ownership
    const Listing = await Listing.findByListingId(ListingId);

    if (!Listing) {
      return res.status(404).send({
        status: "error",
        statusCode: 404,
        error: {
          code: "Listing_NOT_FOUND",
          message: "Listing not found.",
          details: "The requested Listing could not be found.",
        },
      });
    }

    // Check if the user making the request is the owner of the Listing
    if (Listing.user_id !== req.userId) {
      return res.status(403).send({
        status: "error",
        statusCode: 403,
        error: {
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this Listing.",
          details: "You can only delete your own Listings.",
        },
      });
    }

    // If authorized, delete the Listing
    await Listing.deleteById(ListingId);
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "Listing deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting Listing:", err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_DELETING_Listing",
        message: "An error occurred while deleting the Listing.",
        details: "Please try again later.",
      },
    });
  }
};
