const mongoose = require('mongoose')
const Facultymongo = mongoose.model('Facultymongo')


const getprofile = async (req, res) => {
    console.log(req.params.nameit);
    const nameoffac = (
      await pool.query(`select * from faculty where faculty_id = $1`, [
        req.params.nameit,
      ])
    ).rows[0];
    Facultymongo.find({ emailID: nameoffac.email }, (err, foundItems) => {
      console.log(foundItems);
      res.render("profile", {
        namef: nameoffac,
        allItems: foundItems,
      });
    });
}

module.exports = {
    getprofile
}