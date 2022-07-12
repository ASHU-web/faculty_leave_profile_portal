function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.designation === "HOD" || req.user.designation === "DOFA") {
        return res.redirect("/dashboarhodccf");
      } else if (req.user.designation === "Director") {
        return res.redirect("/dashboardir");
      } else if (req.user.designation === "Faculty") {
        return res.redirect("/dashboard");
      }
    }
  
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  }
  
  app.listen(3000, function () {
    console.log("Listening to port 3000..");
  });

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated
}