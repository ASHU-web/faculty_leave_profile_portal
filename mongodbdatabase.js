const mongoose = require("mongoose");
const router = express.Router()


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

mongoose.model("Facultymongo", facultyschema);
