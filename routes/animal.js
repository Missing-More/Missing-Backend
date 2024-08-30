const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const animalController = require("../controllers/animalController");


module.exports = router;