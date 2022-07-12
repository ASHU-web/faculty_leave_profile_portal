const getlogout = (req, res) => {
    req.logOut();
    req.flash("success_msg", "You have successfully logged out");
    res.redirect("/login");
  }

  module.exports = {
    getlogout
  }