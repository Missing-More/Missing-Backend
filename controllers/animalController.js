import { getPostsByUserId, getPostById } from "../models/animalModel";


export async function getMyPosts(req, res) {
  try {
    // Get the user ID from the request
    const userId = req.userId;

    // Query the database to get the posts associated with the user
    const posts = await getPostsByUserId(userId); // Assume this function retrieves the posts by user ID

    // Success response
    res.status(200).send({
      status: "success",
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).send({
      status: "error",
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving the posts.",
        details: error.message,
      },
    });
  }
}


export async function getPostById(req, res) {
    try {
        // Get the post ID from the request
        const postId = req.id;

        // Query the database to get the post by ID
        const post = await getPostById(postId); // Assume this function retrieves the post by ID

        // Check if the post exists
        if (!post) {
            return res.status(404).send({
                status: "error",
                statusCode: 404,
                error: {
                    code: "POST_NOT_FOUND",
                    message: "Post not found",
                },
            });
        }

        // Success response
        res.status(200).send({
            status: "success",
            message: "Post retrieved successfully",
            data: post,
        });
    } catch (error) {
        console.error("Error retrieving post:", error);
        res.status(500).send({
            status: "error",
            statusCode: 500,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred while retrieving the post.",
                details: error.message,
            },
        });
    }
}
