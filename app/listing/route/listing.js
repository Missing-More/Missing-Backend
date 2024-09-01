const express = require("express");
const router = express.Router();
const listingController = require("../controller/listingController");
const verifyToken = require('../../middlewares/verifyToken');

/**
 * @route GET /Listings/getListingById
 * @param {number} ListingId.query.required - Listing ID
 */
router.get("/getListingById", listingController.getListingById);

/**
 * @route GET /Listings/getMyListings
 * @param {number} userId.query.required
 */
router.get("/getMyListings", verifyToken, listingController.getMyListings);

/**
 * @route Listing /Listings/createListing
 * @param {string} title.body.required - Title
 * @param {string} description.body.required - Description
 */
router.post("/createListing", verifyToken, listingController.createListing);
/*
/**
 * @route Listing /Listings/getNearbyListings
 * @param {number} longitude.body.required - Longitude
 * @param {number} latitude.body.required - Latitude
 * @param {number} radius.body.required - Radius
 * @param {number} category_id.body.required - Category
 */
router.get("/getNearbyLostItems", listingController.getNearbyLostItem);

/**
 * @route Listing /Listings/deleteListingById
 * @param {number} ListingId.body.required - Listing ID
 */
router.post("/deleteListingById", verifyToken, listingController.deleteListingById);

/**
 * @route Listing /Listings/updateListingById
 * @param {number} ListingId.body.required - Listing ID
 */
router.post("/updateListingById", verifyToken, listingController.updateListingById);

/**
 * @route GET /Listings/allListings
 * @group Listing - Operations about Listing
 * @returns {object} 200 - Listings retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get("/allListings", listingController.getAllListings);

module.exports = router;
