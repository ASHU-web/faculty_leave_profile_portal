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
