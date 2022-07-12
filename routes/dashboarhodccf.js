const express = require("express");
const router = express.Router()
const {
  getdashboardccf,
  postdashboardccf } = require("../controllers/dashboarhodccf")
const { checkNotAuthenticated } = require("../controllers/auth")

router.get("/", checkNotAuthenticated, getdashboardccf);
router.post("/", postdashboardccf);

module.exports = router