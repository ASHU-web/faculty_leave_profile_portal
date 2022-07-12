const express = require("express");
const router = express.Router()

const {
  getdashboard,
  postdashboard} = require('../controllers/dashboard')
const checkNotAuthenticated = require("../controllers/auth")

router.get("/", checkNotAuthenticated, getdashboard);
router.post("/", postdashboard);



module.exports = router
