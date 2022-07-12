const express = require("express");
const router = express.Router()
const {
  postlogin,
  getlogin} = require("../controllers/login")
const {checkAuthenticated} = require("../controllers/auth")

router.get("/", checkAuthenticated, getlogin );
router.post("/", postlogin);


module.exports = router