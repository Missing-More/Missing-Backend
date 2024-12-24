const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const verifyToken = require('../../middlewares/verifyToken');


router.get("/:postId", postController.getPost);

router.get("/user/:userId",verifyToken, postController.getUserPosts);

router.post("/create", verifyToken, postController.createPost);

router.get("/nearby", postController.getNearbyPosts);

router.delete("/:postId", verifyToken, postController.deletePost);

/*router.post("/updateListingById", verifyToken, listingController.updateListingById);

router.get("/allListings", listingController.getAllListings);*/

module.exports = router;
