const express = require("express");
const { getlogout } = require("../controllers/logout");
const router = express.Router()



router.get("/", getlogout);


  module.exports = router