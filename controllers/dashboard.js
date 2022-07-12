const mongoose = require('mongoose')
const Facultymongo = mongoose.model('Facultymongo')

const getdashboard = async function (req, res) {
    const datait = await pool.query(
      `select * from leave_table 
      where faculty_id = $1 `,
      [req.user.faculty_id]
    );
  
  
    const iskileave2 = await pool.query(
      `select * from comment_table 
      where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
      [req.user.faculty_id]
    );
    Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
    res.render("dashboard", {
      allItems: foundItems,
      userA: req.user.name,
      designationA: req.user.designation,
      departmentA: req.user.department,
      emailidA: req.user.email,
      leavesleftA: req.user.leaves_left,
      table: datait.rows,
      iskileavelelo: iskileave2.rows,
      activeAA: req.user.active,
    });});
  }

  const postdashboard = async function (req, res) {
    let variss = req.body.message2mk;
    let variss2 = req.body.sendkarde;
  
    const leaveidget = (
      await pool.query(
        `select count(leave_id) from leave_table where faculty_id = $1 and status = $2`,
        [req.user.faculty_id, "Clarification pending"]
      )
    ).rows[0].count;
  
    if (!variss2) {
      let date1 = req.body.date1d,
        date2 = req.body.date2d,
        message = req.body.message233;
  
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();
      today = yyyy + "-" + mm + "-" + dd;
      console.log(date1, date2, message);
      let facultyhasid = req.user.faculty_id;
      console.log(today);
  
      var date11 = new Date(date1);
      var date22 = new Date(date2);
  
      var time_difference = date22.getTime() - date11.getTime();
      var result11 = time_difference / (1000 * 60 * 60 * 24);
      let errorsdas = [];
      if (!date1 || !date2) {
        errorsdas.push({
          message: "Please enter both start and end dates of leave application",
        });
      }
      if (date1 < today) {
        if (!message) {
          errorsdas.push({
            message: "Please enter reason for leave as it is a past request",
          });
        }
      }
      if (date1 > date2) {
        errorsdas.push({
          message: "Start date should be previous than the End Date",
        });
      }
      const leavepending = (
        await pool.query(
          `select count(leave_id) from leave_table
                      where faculty_id = $1 and status <> $2 and status <> $3`,
          [req.user.faculty_id, "Accepted", "Rejected"]
        )
      ).rows[0].count;
  
      if (leavepending !== "0") {
        //then
        errorsdas.push({
          message:
            "You can apply only 1 leave at a time. Please wait for the Acception/Rejection of the leave.",
        });
      }
  
      const iskileave2 = await pool.query(
        `select * from comment_table 
          where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
        [req.user.faculty_id]
      );
      const datait = await pool.query(
        `select * from leave_table 
                  where faculty_id = $1`,
        [req.user.faculty_id]
      );
  
      if (errorsdas.length > 0) {
      
        await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
        
        res.render("dashboard", {
          allItems: foundItems,
          userA: req.user.name,
          designationA: req.user.designation,
          departmentA: req.user.department,
          emailidA: req.user.email,
          leavesleftA: req.user.leaves_left,
          table: datait.rows,
          iskileavelelo: iskileave2.rows,
          activeAA: req.user.active,
          errorsdas
        });
        });
       
        console.log("Render ho gaya pakka?");
        res.redirect("/dashboard");
  
    
      } else {
        pool.query(
          ` insert into leave_table( faculty_id ,applied_on ,date_from ,date_to, reason )					
                                      values($1 , $2, $3, $4, $5)	`,
          [facultyhasid, today, date1, date2, message],
          (err, results) => {
            console.log(result11);
            if (result11 <= req.user.leaves_left) {
              req.flash("success_msg", "Leave Application successfully made");
            }
            if (result11 > req.user.leaves_left) {
              req.flash(
                "success_msg",
                "Leave Application successfully made. Requested dates exceeded the available leaves. End date adjusted accordingly"
              );
            }
            res.redirect("/dashboard");
          }
        );
      }
    } else {
      errorsdas = [];
      if (leaveidget === "0") {
        errorsdas.push({
          message:
            "No clarifications asked till now!! You are allowed to send clarifications only when Status is 'Clarifaication pending'",
        });
      }
  
      const iskileave2 = await pool.query(
        `select * from comment_table 
          where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
        [req.user.faculty_id]
      );
      const datait = await pool.query(
        `select * from leave_table 
                  where faculty_id = $1`,
        [req.user.faculty_id]
      );
  
      if (errorsdas.length > 0) {
        await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboard", {
            allItems: foundItems,
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            table: datait.rows,
            iskileavelelo: iskileave2.rows,
            activeAA: req.user.active,
            errorsdas
          });});
  
        console.log("Render ho gaya pakka?");
        res.redirect("/dashboard");
      } else {
        const leaveidget2 = (
          await pool.query(
            `select * from leave_table where faculty_id = $1 and status = $2`,
            [req.user.faculty_id, "Clarification pending"]
          )
        ).rows[0].leave_id;
  
        await pool.query(
          `insert into temp_table values($1, $2, $3, $4)`,
          [leaveidget2, req.user.faculty_id, variss2, variss],
          (err, results) => {
            req.flash("success_msg", "Clarification Sent Successfully!!");
            res.redirect("/dashboard");
          }
        );
      }
    }
  }

  module.exports = {
    getdashboard,
    postdashboard
  }