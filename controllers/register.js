const mongoose = require('mongoose')
const Facultymongo = mongoose.model('Facultymongo')
const { pool } = require("../dbConfig");
const flash = require("express-flash");

const getregister = function (req, res) {
    res.render("register");
  }

const postregister = async function (req, res) {
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
  }

  module.exports = {
    getregister,
    postregister
  }