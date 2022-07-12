const express = require("express");
const router = express.Router()

const {getprofile} = require("../controllers/profile");




router.get("/:nameit", getprofile);
  


  module.exports = router