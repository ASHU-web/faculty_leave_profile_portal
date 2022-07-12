const gethome = async function (req, res) {
    const allfacname = await pool.query(
      `select * from faculty where faculty_id >1`
    );
    res.render("home", {
      facdata2: allfacname.rows,
    });
}

module.exports  = {
    gethome
}