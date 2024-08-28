const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const animalController = require("../controllers/animalController");


router.get("/getMyPosts", verifyToken, animalController.getMyPosts);

//router.get("/getNearbyPosts", animalController.getNearbyPosts);

router.get("/getPostById", animalController.getPostById);

/*router.get("/allPosts", animalController.getAllPosts);*/

module.exports = router;