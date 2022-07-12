const express = require("express");
const { getprofileauth, postprofileauth } = require("../controllers/profileauth");
const router = express.Router()
const {
  getprofileauth,
  postprofileauth
} = require("../controllers/profileauth")

const {checkNotAuthenticated} = require("../controllers/auth")

router.get("/", checkNotAuthenticated,getprofileauth );
router.post("/profileauth",postprofileauth);
  
  
  module.exports = router