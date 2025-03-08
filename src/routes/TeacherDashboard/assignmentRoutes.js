const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getNewAssignmentForm,
  createAssignment,
  getEditAssignmentForm,
  updateAssignment
} = require("../../controllers/teacherDashboard/assignmentController");

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Ensure the uploads folder path is correct
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Route to render new assignment form (e.g., /teacher/assignment/new?email=...&classNumber=...&subject=...)
router.get("/new", getNewAssignmentForm);

// Route to create a new assignment
router.post("/upload", upload.single("file"), createAssignment);

// Route to render the edit assignment form
router.get("/edit/:id", getEditAssignmentForm);

// Route to update an assignment
router.post("/update/:id", upload.single("file"), updateAssignment);

module.exports = router;
