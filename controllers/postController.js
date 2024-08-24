// Update a Post identified by the postId in the request
exports.updatePost = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Post.updateById(
        req.params.postId,
        new Post(
            req.params.postId,
            req.body.user_id,
            req.body.title,
            req.body.description,
            req.body.category,
            null, // created_at should not be updated
            new Date(), // updated_at
            req.body.reward,
            req.body.lost_location,
            req.body.lost_date
        ),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Post with id ${req.params.postId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Post with id " + req.params.postId
                    });
                }
            } else res.send(data);
        }
    );
};

// Delete a Post with the specified postId in the request
exports.deletePost = (req, res) => {
    Post.remove(req.params.postId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Post with id ${req.params.postId}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Post with id " + req.params.postId
                });
            }
        } else res.send({ message: `Post was deleted successfully!` });
    });
};