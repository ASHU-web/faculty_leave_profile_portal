const passport = require("passport");
const { pool } = require("../dbConfig");

const getlogin = async function (req, res) {
    await pool.query(`update update_date set today = Current_date`);
    res.render("login");
  }

const postlogin = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
})


module.exports = {
    postlogin,
    getlogin
}