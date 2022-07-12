const express = require("express");
const router = express.Router()

const {
  getdashboard,
  postdashboard} = require('../controllers/dashboard')
const { checkNotAuthenticated } = require("../controllers/auth")

router.post("/", postdashboard);

router.get("/", checkNotAuthenticated, getdashboard);



module.exports = router
