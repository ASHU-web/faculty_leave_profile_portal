const express = require("express");
const router = express.Router()
const {
getdashboardir,
postdashboardir} = require('../controllers/dashboardir')

const checkNotAuthenticated = require("../controllers/auth")
router.get("/", checkNotAuthenticated,getdashboardir );
router.post("/", postdashboardir);

module.exports = router