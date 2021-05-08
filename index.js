//Modules
const express = require("express");
const bodyParser = require("body-parser");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const mongoose = require("mongoose");
const pg = require("pg");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.connect("mongodb://localhost:27017/faculty_portal", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const educationalback = new mongoose.Schema({
  description_edu: {
    type: String,
    default: "",
  },
  institute: {
    type: String,
    default: "",
  },
  start_year: {
    type: String,
    default: "",
  },
  end_year: {
    type: String,
    default: "",
  },
});


const publicationmongoose = new mongoose.Schema({
  publication_year: {
    type: Number,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  link: {
    type: String,
    default: "",
  },
});

const coursesmongoose = new mongoose.Schema({
  course_year: {
    type: Number,
    default: "",
  },
  coursename: {
    type: String,
    default: "",
  },
  coursecode: {
    type: String,
    default: "",
  },
});

const facultyschema = new mongoose.Schema({
  emailID: { type: String, unique: true },
  researchTopics: [String],
  publications: [publicationmongoose],
  courses: [coursesmongoose],
  courseno: { type: Number, default: 0 },
  total_publications: { type: Number, default: 0 },
  background_para1: { type: String, default: "" },
  background_para2: { type: String, default: "" },
  profileurl: { type: String, default: "../assetsdash/img/profile.png" },
  educationalbackg: [educationalback]
});

const Facultymongo = mongoose.model("Facultymongo", facultyschema);

// async function cc(){
// const facultymon = new Facultymongo({
//     emailID: 'singla@iitrpr.ac.in',
//     researchTopics: [],
//     background_para1: 'Hello, Add your Educational Background',
//     background_para2: 'Tell About your researches..'
// })

// const result  = await facultymon.save();
// console.log(result);}
// cc();

require("dotenv").config();
const app = express();

const initializePassport = require("./passportConfig");
const { render } = require("ejs");
initializePassport(passport);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
const poolSession = new (require("connect-pg-simple")(session))({
  pool: pool,
});

app.set("trust proxy", 1);
app.use(
  session({
    store: poolSession,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 30 * 60 * 24 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", checkAuthenticated, function (req, res) {
  res.render("success");
});

app.get("/home", async function (req, res) {
  const allfacname = await pool.query(
    `select * from faculty where faculty_id >1`
  );
  res.render("home", {
    facdata2: allfacname.rows,
  });
});

app.get("/login", checkAuthenticated, async function (req, res) {
  await pool.query(`update update_date set today = Current_date`);
  res.render("login");
});

app.get("/profile/:nameit", async (req, res) => {
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
});
app.get("/profileauth", checkNotAuthenticated, (req, res) => {
  Facultymongo.find({ emailID: req.user.email }, (err, foundItems) => {
    // console.log(foundItems);
    res.render("profileauth", {
      allItems: foundItems,
      userA: req.user.name,
      designationA: req.user.designation,
      departmentA: req.user.department,
      emailA: req.user.email,
    });
  });
});

app.get("/register", checkAuthenticated, function (req, res) {
  res.render("register");
});
// app.get("/register", checkAuthenticated, (req, res)=>{
//     res.render("success");
// });
app.get("/dashboard", checkNotAuthenticated, async function (req, res) {
  const datait = await pool.query(
    `select * from leave_table 
    where faculty_id = $1 `,
    [req.user.faculty_id]
  );

  // const leaveidget =  (await pool.query(`select count(leave_id) from leave_table where faculty_id = $1 and status = $2`,
  // [req.user.faculty_id, "Clarification pending"])).rows[0].count;

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
});
app.get("/dashboardir", checkNotAuthenticated, async function (req, res) {
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
});

app.get("/dashboarhodccf", checkNotAuthenticated, async function (req, res) {
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
});

app.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have successfully logged out");
  res.redirect("/login");
});

app.post("/profileauth", async function (req, res) {
  let para1 = req.body.para1;
  let para2 = req.body.para2;
  let nameoftopic = req.body.topicbtao;
  let courselist = req.body.courselistadd;
  let publicationsit = req.body.approvepub;
  //console.log("PARA1:" + para1  + "Para2:" + para2 + "publicationsit:"  + publicationsit);
  if (para2 !== undefined || para1 !== undefined) {
    if (para2 !== "" && para1 === "") {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        {
          background_para2: para2,
        },
        function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully Updated the document.");

            req.flash(
              "success_msg",
              "Background and research interests Section Updated"
            );
            res.redirect("/profileauth");
          }
        }
      );
    } else if (para2 === "" && para1 !== "") {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        {
          background_para1: para1,
        },
        function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully Updated the document.");

            req.flash(
              "success_msg",
              "Background and research interests Section Updated"
            );
            res.redirect("/profileauth");
          }
        }
      );
    } else {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        {
          background_para1: para1,
          background_para2: para2,
        },
        function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully Updated the document.");

            req.flash(
              "success_msg",
              "Background and research interests Section Updated"
            );
            res.redirect("/profileauth");
          }
        }
      );
    }
  } else if (req.body.topicvalue !== undefined) {
    // console.log("HEREAA:" + nameoftopic);
    var topicvalue = req.body.topicvalue;
    if (topicvalue !== "Add Topic") {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        { $pullAll: { researchTopics: [topicvalue] } },

        function (err) {
          if (err) {
            console.log(err);
          } else {
            req.flash(
              "success_msg",
              "Research Topic Removed Successfully."
            );
            res.redirect("/profileauth");
          }
        }
      );
    } else {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        { $addToSet: { researchTopics: [nameoftopic] } },

        function (err) {
          if (err) {
            console.log(err);
          } else {
            req.flash(
              "success_msg",
              "Research Topic Added Successfully. If you repeated the same topic, It won't be shown twice"
            );
            res.redirect("/profileauth");
          }
        }
      );
    }
  } else if (courselist !== undefined) {
    // async function cc(){
    // const facultymon = new Facultymongo({
    //     emailID: 'singla@iitrpr.ac.in',
    //     researchTopics: [],
    //     background_para1: 'Hello, Add your Educational Background',
    //     background_para2: 'Tell About your researches..'
    // })

    // const result  = await facultymon.save();
    // console.log(result);}
    // cc();
    if (courselist === "courseadd") {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        {
          $addToSet: {
            courses: [
              {
                course_year: req.body.tinyear,
                coursecode: req.body.coursecode,
                coursename: req.body.coursename,
              },
            ],
          },
        },

        function (err) {
          if (err) {
            console.log(err);
          } else {
            req.flash(
              "success_msg",
              "Course Added Successfully."
            );
            res.redirect("/profileauth");
          }
        }
      );
    }
     else{
       console.log(courselist + " : BBSS");
      Facultymongo.find({ emailID: req.user.email }, (err, foundit) => {
        //   console.log(foundit);
           var itis =  1;
           foundit.forEach(function (itee) {
             console.log("Leng: " + itee.courses.length);
             for(var i = 0; i< itee.courses.length ; i++){
             console.log( itee.courses[i]._id  + "   ::: this::: "  + req.body.courselistadd + " : This" );
             if (itee.courses[i]._id == req.body.courselistadd ) {
              
              itis = 2;
               Facultymongo.updateOne(
                 { emailID: req.user.email },
                 { $pullAll: { courses: [itee.courses[i]] } },
                 function (err) {
                   if (err) {
                     console.log(err);
                   } else {
                     req.flash(
                       "success_msg",
                       "Course Removed Successfully."
                     );
                     res.redirect("/profileauth");
                    
                   }
                 }
               );
             }}
             if(itis == 1){
                   
                   req.flash(
                     "failure_msg",
                     "No Course Found."
                   );
                   res.redirect("/profileauth");
                  
                 
             }
           
           });
           
         });
     }
  } else if (publicationsit !== undefined) {
    if (publicationsit === "Acceptedpub") {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        {
          $addToSet: {
            publications: [
              {
                publication_year: req.body.yearofpub,
                title: req.body.titleforpub,
                link: req.body.urlit,
              },
            ],
          },
        },

        function (err) {
          if (err) {
            console.log(err);
          } else {
            req.flash(
              "success_msg",
              "Publication Added Successfully."
            );
            res.redirect("/profileauth");
          }
        }
      );
    } else {
      Facultymongo.find({ emailID: req.user.email }, (err, foundit) => {
     //   console.log(foundit);
        var itis =  1;
        foundit.forEach(function (itee) {
          //console.log("Leng: " + itee.publications.length);
          for(var i = 0; i< itee.publications.length ; i++){
           
          if (itee.publications[i]._id == publicationsit ) {
           itis = 2;
            Facultymongo.updateOne(
              { emailID: req.user.email },
              { $pullAll: { publications: [itee.publications[i]] } },
              function (err) {
                if (err) {
                  console.log(err);
                } else {
                  req.flash(
                    "success_msg",
                    "Publication Removed Successfully."
                  );
                  res.redirect("/profileauth");
                 
                }
              }
            );
          }}
          if(itis == 1){
                
                req.flash(
                  "failure_msg",
                  "No Publication Found."
                );
                res.redirect("/profileauth");
               
              
          }
        
        });
        
      });
    }
  }
  else if(req.body.profilepic !== undefined){
    Facultymongo.updateOne(
      { emailID: req.user.email },
  { profileurl: req.body.urlit4 },
      function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash(
            "success_msg",
            "Profile Picture Updated Successfully."
          );
          res.redirect("/profileauth");
         
        }
      }
    );
  }
  else if(req.body.approvekardo !== undefined){
    if (req.body.approvekardo === "yesss") {
      Facultymongo.updateOne(
        { emailID: req.user.email },
        {
          $addToSet: {
            educationalbackg: [
              {
                description_edu: req.body.descrip,
                  institute: req.body.instiname,
                start_year: req.body.syea,
                end_year: req.body.eyea
              },
            ],
          },
        },

        function (err) {
          if (err) {
            console.log(err);
          } else {
            req.flash(
              "success_msg",
              "Education Added Successfully."
            );
            res.redirect("/profileauth");
          }
        }
      );
    } else {
      Facultymongo.find({ emailID: req.user.email }, (err, foundit) => {
     //   console.log(foundit);
        var itis =  1;
        foundit.forEach(function (itee) {
          //console.log("Leng: " + itee.publications.length);
          for(var i = 0; i< itee.educationalbackg.length ; i++){
           
          if (itee.educationalbackg[i]._id == req.body.approvekardo) {
           itis = 2;
            Facultymongo.updateOne(
              { emailID: req.user.email },
              { $pullAll: { educationalbackg: [itee.educationalbackg[i]] } },
              function (err) {
                if (err) {
                  console.log(err);
                } else {
                  req.flash(
                    "success_msg",
                    "Education Removed Successfully."
                  );
                  res.redirect("/profileauth");
                 
                }
              }
            );
          }}
          if(itis == 1){
                
                req.flash(
                  "failure_msg",
                  "No Publication Found."
                );
                res.redirect("/profileauth");
               
              
          }
        
        });
        
      });
    }
  }
});

app.post("/dashboardir", async function (req, res) {
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
});

app.post("/dashboarhodccf", async function (req, res) {
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
});

app.post("/dashboard", async function (req, res) {
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
});
app.post("/register", async function (req, res) {
  let { name, email, password, password2, department } = req.body;
  console.log({
    name,
    email,
    password,
    password2,
    department,
  });

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please Enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password should be atleast 6 characters" });
  }
  if (password.length > 19) {
    errors.push({ message: "Password should be less than 20 characters" });
  }

  if (password != password2) {
    errors.push({ message: "Password do not matched" });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    //All validations passed, checking if user exists or not

    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
      `SELECT * from faculty 
            where email  = $1 `,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "Email already registered. Please login" });
          res.render("register", { errors });
        } else {
          async function cc() {
            const facultymon = new Facultymongo({
              emailID: email,
              researchTopics: [],
              background_para1: "Fill Up your Educational Background Now",
              background_para2: "Explain Your research Interests here",
              profileurl: "../assetsdash/img/profile.png",
            });

            const result = await facultymon.save();
            console.log(result);
          }
          cc();
          pool.query(
            ` insert into faculty  (name, email, password, department, designation)
                        values ($1, $2, $3, $4,'Faculty')   `,
            [name, email, hashedPassword, department],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash(
                "success_msg",
                "You are successfully registered. Please Login"
              );
              res.redirect("/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  //  if(req.user.designation === "Director"){
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