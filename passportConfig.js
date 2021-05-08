const LocalStrategy = require("passport-local").Strategy;
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport){
    const authenticateUser = (email, password, done)=>{
        pool.query(
            `select * from faculty
            where email = $1`,
            [email],
            (err, results) =>{
                if(err){
                    throw err;
                }
                console.log(results.rows);
                if(results.rows.length > 0){
                    const user = results.rows[0];

                    bcrypt.compare(password, user.password,(err, isMatch)=>{
                        if(err){
                            throw err;

                        }
                        if(isMatch){
                            return done(null, user);
                        }
                        else {
                            return done(null, false, {message: "Incorrect Password, Please try again!"});
                        }
                    });

                }
                else {
                    return done(null, false, {message: "Email is not registered. Please check your email or register to continue"});
                }
            }
        )
    }
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    },
    authenticateUser
    ));
    passport.serializeUser((user, done)=> done(null, user.faculty_id));
    passport.deserializeUser((faculty_id, done)=>{
        pool.query(
            `select * from faculty where faculty_id = $1`, [faculty_id], (err, results)=>{
                if(err){
                    throw err
                }
                console.log(`ID is ${results.rows[0].faculty_id}`);
                
                return done(null, results.rows[0]);
            }
        );
    });   
}
module.exports = initialize;