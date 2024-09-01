const Listing = require("../model/listingModel");


exports.getListingById = async (req, res) => {
  try {
    const ListingId = req.query.Listing_id;
    const Listing = await Listing.findByListingId(ListingId);
    if (!Listing) {
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
      res.status(200).send(Listing);
    }
  } catch (error) {
    console.error("Error retrieving Listing:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving the Listing.",
        details: error.message,
      },
    });
  }
}
  


/**
 * Create a new Listing
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
exports.createListing = async (req, res) => {
  try {
    const result = await Listing.createListing(req); // Ensure to use await for async calls
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


exports.getNearbyLostItem = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const Listings = await Listing.getNearbyLostItems(req);
    res.status(200).send(Listings);
  } catch (err) {
    console.error("Error retrieving nearby Listings:", err);
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


exports.getMyListings = async (req, res) => {
  try {
    const userId = req.userId;
    const Listings = await Listing.getAllByUserId(userId);
    res.status(200).send(Listings);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "ERROR_FINDING_ListingS",
        message: "An error occurred while finding Listings by user ID.",
        details: "Please try again later.",
      },
    });
  }
};


/**
 * Retrieve all Listings
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
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

/**
 * Update a Listing by ID
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
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
