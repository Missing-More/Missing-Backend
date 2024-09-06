const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const verifyToken = require('../../middlewares/verifyToken');


router.get("/", postController.getPost);

router.get("/myPosts", verifyToken, postController.getMyPosts);

router.post("/create", verifyToken, postController.createPost);

router.get("/nearbyPosts", postController.getNearbyPosts);

/*router.post("/deleteListingById", verifyToken, listingController.deleteListingById);

router.post("/updateListingById", verifyToken, listingController.updateListingById);

router.get("/allListings", listingController.getAllListings);*/

module.exports = router;
