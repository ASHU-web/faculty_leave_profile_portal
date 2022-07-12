const express = require("express");
const router = express.Router()
const {
  getregister,
  postregister } = require("../controllers/register")
const {
  checkAuthenticated
} = require("../controllers/auth")

router.get("/", checkAuthenticated, getregister);
router.post("/", postregister);

module.exports = router