//Modules
const express = require("express");
const bodyParser = require("body-parser");
const { pool } = require("./dbConfig");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const { checkAuthenticated } = require("./controllers/auth")
//routes
const mongodbdatabase = require("./mongodbdatabase")

// const mongoose = require("mongoose");


// mongoose.set("useNewUrlParser", true);
// mongoose.set("useFindAndModify", false);
// mongoose.set("useCreateIndex", true);

// mongoose.connect("mongodb://localhost:27017/faculty_portal", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const educationalback = new mongoose.Schema({
//   description_edu: {
//     type: String,
//     default: "",
//   },
//   institute: {
//     type: String,
//     default: "",
//   },
//   start_year: {
//     type: String,
//     default: "",
//   },
//   end_year: {
//     type: String,
//     default: "",
//   },
// });

// const publicationmongoose = new mongoose.Schema({
//   publication_year: {
//     type: Number,
//     default: "",
//   },
//   title: {
//     type: String,
//     default: "",
//   },
//   link: {
//     type: String,
//     default: "",
//   },
// });

// const coursesmongoose = new mongoose.Schema({
//   course_year: {
//     type: Number,
//     default: "",
//   },
//   coursename: {
//     type: String,
//     default: "",
//   },
//   coursecode: {
//     type: String,
//     default: "",
//   },
// });

// const facultyschema = new mongoose.Schema({
//   emailID: { type: String, unique: true },
//   researchTopics: [String],
//   publications: [publicationmongoose],
//   courses: [coursesmongoose],
//   courseno: { type: Number, default: 0 },
//   total_publications: { type: Number, default: 0 },
//   background_para1: { type: String, default: "" },
//   background_para2: { type: String, default: "" },
//   profileurl: { type: String, default: "../assetsdash/img/profile.png" },
//   educationalbackg: [educationalback]
// });

// mongoose.model("Facultymongo", facultyschema);



const register = require('./routes/register');
const profileauth = require('./routes/profileauth');
const dashboard = require('./routes/dashboard');
const dashboardir = require('./routes/dashboardir');
const dashboarhodccf = require('./routes/dashboarhodccf');
const home = require('./routes/home');
const login = require('./routes/login');
const logout = require('./routes/logout');
const profile = require('./routes/profile');


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


app.use('/register',register);
app.use('/profileauth', profileauth);
app.use('/profile',profile);
app.use('/logout', logout );
app.use('/login', login);
app.use('/home', home);
app.use('/dashboarhodccf', dashboarhodccf);
app.use('/dashboardir', dashboardir);
app.use('/dashboard', dashboard);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", checkAuthenticated, function (req, res) {
  res.render("success");
});

app.listen(3000, function () {
  console.log("Listening to port 3000..");
});
