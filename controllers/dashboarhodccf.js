const mongoose = require('mongoose')
const Facultymongo = mongoose.model('Facultymongo')


const getdashboardccf = async function (req, res) {
    if (req.user.designation === "HOD") {
      const leavedata = await pool.query(
        `select * from leave_table,  faculty
                                  where (leave_table.leave_id > 1 and leave_table.status = $1 and faculty.department = $2
                                  and faculty.designation <> $3 and faculty.designation<> $4 and leave_table.faculty_id=faculty.faculty_id)`,
        ["Pending with HOD", req.user.department, "HOD", "DOFA"]
      );
      const iskileave = await pool.query(
        `select * from comment_table 
                                  where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
        [req.user.faculty_id]
      );
      const datait3 = await pool.query(
        `select * from leave_table 
                                  where faculty_id = $1`,
        [req.user.faculty_id]
      );
      const pendign22 = await pool.query(`select * from comment_table`);
      Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
      res.render("dashboarhodccf", {
        allItems: foundItems,
        userA: req.user.name,
        designationA: req.user.designation,
        departmentA: req.user.department,
        emailidA: req.user.email,
        leavesleftA: req.user.leaves_left,
        leaveddd: leavedata.rows,
        currstatus: iskileave.rows,
        table: datait3.rows,
        pendign3: pendign22.rows,
      });});
    } else {
      const leavedata = await pool.query(
        `select * from leave_table,  faculty
      where (leave_table.leave_id > 1 and leave_table.status = $1 
      and faculty.designation <> $2 and faculty.designation<> $3 and leave_table.faculty_id=faculty.faculty_id)`,
        ["Pending with Dean FA", "HOD", "DOFA"]
      );
  
      const iskileave = await pool.query(
        `select * from comment_table 
          where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
        [req.user.faculty_id]
      );
  
      const datait3 = await pool.query(
        `select * from leave_table 
          where faculty_id = $1`,
        [req.user.faculty_id]
      );
      const pendign22 = await pool.query(`select * from comment_table`);
      Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
      res.render("dashboarhodccf", {
        allItems: foundItems,
        userA: req.user.name,
        designationA: req.user.designation,
        departmentA: req.user.department,
        emailidA: req.user.email,
        leavesleftA: req.user.leaves_left,
        leaveddd: leavedata.rows,
        currstatus: iskileave.rows,
        table: datait3.rows,
        pendign3: pendign22.rows,
      });});
    }
  }


  const postdashboardccf = async function (req, res) {
    let leaveidresp = req.body.leaveid;
    let commentdone = req.body.message2;
    let clarifyit = req.body.message2mkc;
    let varisss = req.body.sendkarde22;
    console.log(varisss + "hereee");
  
    if (!leaveidresp && !clarifyit) {
      let { date1, date2, message } = req.body;
  
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
  
      if (errorsdas.length > 0) {
        if (req.user.designation === "HOD") {
          const leavedata = await pool.query(
            `select * from leave_table,  faculty
                                              where (leave_table.leave_id > 1 and leave_table.status = $1 and faculty.department = $2
                                              and faculty.designation <> $3 and faculty.designation<> $4 and leave_table.faculty_id=faculty.faculty_id)`,
            ["Pending with HOD", req.user.department, "HOD", "DOFA"]
          );
          const iskileave = await pool.query(
            `select * from comment_table 
                                              where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
            [req.user.faculty_id]
          );
          const datait3 = await pool.query(
            `select * from leave_table 
                                              where faculty_id = $1`,
            [req.user.faculty_id]
          );
          const pendign22 = await pool.query(`select * from comment_table`);
          await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboarhodccf", {
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            leaveddd: leavedata.rows,
            currstatus: iskileave.rows,
            pendign3: pendign22.rows,
            table: datait3.rows,
            errorsdas,
            allItems: foundItems
          });});
        } else {
          const leavedata = await pool.query(
            `select * from leave_table,  faculty
                                              where (leave_table.leave_id > 1 and leave_table.status = $1 
                                              and faculty.designation <> $2 and faculty.designation<> $3 and leave_table.faculty_id=faculty.faculty_id)`,
            ["Pending with Dean FA", "HOD", "DOFA"]
          );
  
          const iskileave = await pool.query(
            `select * from comment_table 
                                                  where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
            [req.user.faculty_id]
          );
  
          const datait3 = await pool.query(
            `select * from leave_table 
                                                  where faculty_id = $1`,
            [req.user.faculty_id]
          );
          const pendign22 = await pool.query(`select * from comment_table`);
          await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboarhodccf", {
            allItems: foundItems,
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            leaveddd: leavedata.rows,
            currstatus: iskileave.rows,
            pendign3: pendign22.rows,
            table: datait3.rows,
            errorsdas,
          });});
        }
        res.redirect("/dashboarhodccf");
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
            res.redirect("/dashboarhodccf");
          }
        );
      }
    } else if (!clarifyit) {
      //take action/respond to requests
      if (req.user.designation === "HOD") {
        let errorsdas = [];
        const checkifexist = (
          await pool.query(
            `select count(leave_id) from leave_table
              where leave_id = $1 and department = $2 and status = $3`,
            [leaveidresp, req.user.department, "Pending with HOD"]
          )
        ).rows[0].count;
  
        console.log(checkifexist + "chabvhad");
  
        if (checkifexist === "0") {
          errorsdas.push({
            message: "Please enter a valid Leave ID from the table shown",
          });
        }
  
        if (errorsdas.length > 0) {
          const leavedata = await pool.query(
            `select * from leave_table,  faculty
                                  where (leave_table.leave_id > 1 and leave_table.status = $1 and faculty.department = $2
                                  and faculty.designation <> $3 and faculty.designation<> $4 and leave_table.faculty_id=faculty.faculty_id)`,
            ["Pending with HOD", req.user.department, "HOD", "DOFA"]
          );
          const iskileave = await pool.query(
            `select * from comment_table 
                                  where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
            [req.user.faculty_id]
          );
          const datait3 = await pool.query(
            `select * from leave_table 
                                  where faculty_id = $1`,
            [req.user.faculty_id]
          );
          const pendign22 = await pool.query(`select * from comment_table`);
          await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboarhodccf", {
            allItems: foundItems,
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            leaveddd: leavedata.rows,
            pendign3: pendign22.rows,
            currstatus: iskileave.rows,
            table: datait3.rows,
            errorsdas,
          });});
  
          res.redirect("/dashboarhodccf");
        } else {
          console.log("Queryhere");
          await pool.query(
            `insert into temp_table values($1,$2, $3, $4)`,
            [leaveidresp, req.user.faculty_id, req.body.approve, commentdone],
            (err, results) => {
              req.flash("success_msg", "Respond Sent!!");
              res.redirect("/dashboarhodccf");
            }
          );
        }
      } else {
        let errorsdas = [];
        const checkifexist = (
          await pool.query(
            `select count(leave_id) from leave_table
              where leave_id = $1  and status = $2`,
            [leaveidresp, "Pending with Dean FA"]
          )
        ).rows[0].count;
  
        console.log(checkifexist + "chabvhad");
  
        if (checkifexist === "0") {
          errorsdas.push({
            message: "Please enter a valid Leave ID from the table shown",
          });
        }
  
        if (errorsdas.length > 0) {
          const leavedata = await pool.query(
            `select * from leave_table,  faculty
                          where (leave_table.leave_id > 1 and leave_table.status = $1 
                          and faculty.designation <> $2 and faculty.designation<> $3 and leave_table.faculty_id=faculty.faculty_id)`,
            ["Pending with Dean FA", "HOD", "DOFA"]
          );
  
          const iskileave = await pool.query(
            `select * from comment_table 
                              where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
            [req.user.faculty_id]
          );
  
          const datait3 = await pool.query(
            `select * from leave_table 
                              where faculty_id = $1`,
            [req.user.faculty_id]
          );
          const pendign22 = await pool.query(`select * from comment_table`);
          await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboarhodccf", {
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            leaveddd: leavedata.rows,
            pendign3: pendign22.rows,
            currstatus: iskileave.rows,
            table: datait3.rows,
            allItems: foundItems,
            errorsdas,
          });});
  
          res.redirect("/dashboarhodccf");
        } else {
          console.log("Queryhere");
          await pool.query(
            `insert into temp_table values($1,$2, $3, $4)`,
            [leaveidresp, req.user.faculty_id, req.body.approve, commentdone],
            (err, results) => {
              req.flash("success_msg", "Respond Sent!!");
              res.redirect("/dashboarhodccf");
            }
          );
        }
      }
    } else {
      //clarification code
      let errorsdas = [];
      const leaveidget = (
        await pool.query(
          `select count(leave_id) from leave_table where faculty_id = $1 and status = $2`,
          [req.user.faculty_id, "Clarification pending"]
        )
      ).rows[0].count;
  
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
        if (req.user.designation === "HOD") {
          const leavedata = await pool.query(
            `select * from leave_table,  faculty
                                  where (leave_table.leave_id > 1 and leave_table.status = $1 and faculty.department = $2
                                  and faculty.designation <> $3 and faculty.designation<> $4 and leave_table.faculty_id=faculty.faculty_id)`,
            ["Pending with HOD", req.user.department, "HOD", "DOFA"]
          );
          const iskileave = await pool.query(
            `select * from comment_table 
                                  where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
            [req.user.faculty_id]
          );
          const datait3 = await pool.query(
            `select * from leave_table 
                                  where faculty_id = $1`,
            [req.user.faculty_id]
          );
          const pendign22 = await pool.query(`select * from comment_table`);
          await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboarhodccf", {
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            leaveddd: leavedata.rows,
            currstatus: iskileave.rows,
            table: datait3.rows,
            pendign3: pendign22.rows,
            errorsdas,
            allItems: foundItems
          });});
        } else {
          const leavedata = await pool.query(
            `select * from leave_table,  faculty
                          where (leave_table.leave_id > 1 and leave_table.status = $1 
                          and faculty.designation <> $2 and faculty.designation<> $3 and leave_table.faculty_id=faculty.faculty_id)`,
            ["Pending with Dean FA", "HOD", "DOFA"]
          );
  
          const iskileave = await pool.query(
            `select * from comment_table 
                              where comment_table.leave_id = (select max(leave_table.leave_id) from leave_table where leave_table.faculty_id = $1) `,
            [req.user.faculty_id]
          );
  
          const datait3 = await pool.query(
            `select * from leave_table 
                              where faculty_id = $1`,
            [req.user.faculty_id]
          );
          const pendign22 = await pool.query(`select * from comment_table`);
          await Facultymongo.find({ emailID: req.user.email }, (err, foundItems) =>{
          res.render("dashboarhodccf", {
            userA: req.user.name,
            designationA: req.user.designation,
            departmentA: req.user.department,
            emailidA: req.user.email,
            leavesleftA: req.user.leaves_left,
            leaveddd: leavedata.rows,
            currstatus: iskileave.rows,
            table: datait3.rows,
            pendign3: pendign22.rows,
            errorsdas,
            allItems: foundItems
          });});
        }
        res.redirect("/dashboarhodccf");
      } else {
        const leaveidget2 = (
          await pool.query(
            `select * from leave_table where faculty_id = $1 and status = $2`,
            [req.user.faculty_id, "Clarification pending"]
          )
        ).rows[0].leave_id;
  
        await pool.query(
          `insert into temp_table values($1, $2, $3, $4)`,
          [leaveidget2, req.user.faculty_id, varisss, clarifyit],
          (err, results) => {
            req.flash("success_msg", "Clarification Sent Successfully!!");
            res.redirect("/dashboarhodccf");
          }
        );
      }
    }
  }


module.exports = {
    getdashboardccf,
    postdashboardccf
}