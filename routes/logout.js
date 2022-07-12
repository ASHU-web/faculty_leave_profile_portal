const express = require("express");
const { getlogout } = require("../controllers/logout");
const router = express.Router()
const getlogout = require("../controllers/logout")



router.get("/", getlogout);


  module.exports = router