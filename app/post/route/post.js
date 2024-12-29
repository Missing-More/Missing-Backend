import { Router } from "express";
import { getPostController, getUserPostsController, createPostController, getNearbyPostsController, deletePostController } from "../controller/postController.js";
import verifyToken from '../../middlewares/verifyToken.js';

const router = Router();

router.get("/nearby", getNearbyPostsController);

router.get("/:postId", getPostController);

router.get("/user/:userId", verifyToken, getUserPostsController);

router.post("/create", verifyToken, createPostController);

router.delete("/:postId", verifyToken, deletePostController);

/*router.post("/updateListingById", verifyToken, listing.updateListingById);

router.get("/allListings", listing.getAllListings);*/

export default router;
