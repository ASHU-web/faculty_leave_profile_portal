const mongoose = require('mongoose')
const Facultymongo = mongoose.model('Facultymongo')
const { pool } = require("../dbConfig");
const flash = require("express-flash");

const getdashboardir = async function (req, res) {
    const facdata = await pool.query(`select * from faculty
                                      where faculty_id > 2`);
  
    const leavedata2 = await pool.query(
      `select * from leave_table,  faculty
                                      where (leave_table.leave_id > 1 and leave_table.status = $1 
                                      and leave_table.faculty_id=faculty.faculty_id)`,
      ["Pending with Director"]
    );
  
    const pendign = await pool.query(`select * from comment_table`);
    Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
    res.render("dashboardir", {
      allItems: foundItems,
      leaveddd2: leavedata2.rows,
      facdata2: facdata.rows,
      pendign2: pendign.rows,
    });});
  }


 const postdashboardir =  async function (req, res) {
    let fac_id = req.body.facID;
    let por = req.body.porchange;
    console.log(fac_id);
    if (!fac_id) {
      let errordir = [];
      let leaveidresp = req.body.leaveid22;
      let commentdone = req.body.message22;
  
      const checkifexist = (
        await pool.query(
          `select count(leave_id) from leave_table
              where leave_id = $1  and status = $2`,
          [leaveidresp, "Pending with Director"]
        )
      ).rows[0].count;
  
      console.log(checkifexist + "chabvhad");
  
      if (checkifexist === "0") {
        errordir.push({
          message: "Please enter a valid Leave ID from the table shown",
        });
      }
      const facdata = await pool.query(
        `select * from faculty where faculty_id > 2`
      );
      const leavedata2 = await pool.query(
        `select * from leave_table,  faculty
              where (leave_table.leave_id > 1 and leave_table.status = $1 
              and leave_table.faculty_id=faculty.faculty_id)`,
        ["Pending with Director"]
      );
      if (errordir.length > 0) {
        const pendign = await pool.query(`select * from comment_table`);
        await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
        res.render("dashboardir", {
          allItems: foundItems,
          facdata2: facdata.rows,
          leaveddd2: leavedata2.rows,
          pendign2: pendign.rows,
          errordir,
        });});
        res.redirect("/dashboardir");
      } else {
        await pool.query(
          `insert into temp_table values($1,$2, $3, $4)`,
          [leaveidresp, req.user.faculty_id, req.body.approve2, commentdone],
          (err, results) => {
            req.flash("success_msg", "Respond Sent!!");
            res.redirect("/dashboardir");
          }
        );
      }
    } else {
      console.log(por + " fac:" + fac_id);
      let errordir = [];
      const halfname = por.slice(4);
      console.log(":" + halfname + ":");
      if (por !== "DOFA") {
        const err1 = (
          await pool.query(
            `select count(faculty_id) from faculty 
          where faculty_id = $1 and department = $2`,
            [fac_id, halfname]
          )
        ).rows[0].count;
  
        if (err1 === "0") {
          errordir.push({
            message:
              "INVALID FACULTY ID AND DEPARTMENT COMBINATION. PLEASE TRY AGAIN!",
          });
        }
      }
      const err2 = (
        await pool.query(
          `select count(faculty_id) from faculty
          where faculty_id = $1 and designation = $2`,
          [fac_id, "Faculty"]
        )
      ).rows[0].count;
      if (err2 === "0") {
        errordir.push({
          message:
            "Faculty ID is serving on a POR and hence cannot proceed further.",
        });
      }
      const existsfac = (
        await pool.query(
          `select count(faculty_id) from faculty where faculty_id = $1 `,
          [fac_id]
        )
      ).rows[0].count;
      const facdata = await pool.query(
        `select * from faculty where faculty_id > 2`
      );
      console.log(existsfac + ":hereff");
      if (existsfac === "0") {
        errordir.push({ message: "Faculty ID doesn't Exist" });
      }
      const leavedata2 = await pool.query(
        `select * from leave_table,  faculty
      where (leave_table.leave_id > 1 and leave_table.status = $1 
      and leave_table.faculty_id=faculty.faculty_id)`,
        ["Pending with Director"]
      );
  
      if (errordir.length > 0) {
        const pendign = await pool.query(`select * from comment_table`);
       await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
        res.render("dashboardir", {
          allItems: foundItems,
          facdata2: facdata.rows,
          leaveddd2: leavedata2.rows,
          pendign2: pendign.rows,
          errordir,
        });});
        res.redirect("/dashboardir");
      } else {
        await pool.query(
          `insert into temp_porupdate values($1, $2)`,
          [fac_id, por],
          (err, results) => {
            req.flash(
              "success_msg",
              "POR Changed successfully. New Details are: Faculty ID: " +
                fac_id +
                " for the POR: " +
                por
            );
  
            res.redirect("/dashboardir");
          }
        );
      }
    }
  }

  module.exports=  {
    getdashboardir,
    postdashboardir
  }