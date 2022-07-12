const express = require("express");
const router = express.Router()
const {gethome} = require("../controllers/home")

router.get("/", gethome);

module.exports = router