const mongoose = require('mongoose')
const Facultymongo = mongoose.model('Facultymongo')
const flash = require("express-flash");

const getprofileauth =  (req, res) => {
    Facultymongo.find({ emailID: req.user.email }, (err, foundItems) => {
      res.render("profileauth", {
        allItems: foundItems,
        userA: req.user.name,
        designationA: req.user.designation,
        departmentA: req.user.department,
        emailA: req.user.email,
      });
    });
  }

  const postprofileauth  =  async function (req, res) {
    let para1 = req.body.para1;
    let para2 = req.body.para2;
    let nameoftopic = req.body.topicbtao;
    let courselist = req.body.courselistadd;
    let publicationsit = req.body.approvepub;
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
       
          var itis =  1;
          foundit.forEach(function (itee) {
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
          var itis =  1;
          foundit.forEach(function (itee) {
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
  }


module.exports = {
    postprofileauth,
    getprofileauth
}