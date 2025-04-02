const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadStudyMaterial,
  getStudyMaterials,
  deleteStudyMaterial,
  updateStudyMaterial
} = require("../../controllers/teacherDashboard/studyMaterialController");

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

// Route to render upload form
// Now teacherEmail is expected as a query parameter along with classNumber and subjectName
router.get("/new", (req, res) => {
  const { classNumber, subjectName } = req.query;
  res.render("teacherDashboard/uploadStudyMaterialForm", { classNumber, subjectName });
});

// Get study materials (returns JSON data)
router.get("/:classNumber/:subjectName", getStudyMaterials);

// Upload study material (with file upload)
router.post("/upload", upload.single("file"), uploadStudyMaterial);

// Update study material (with file upload)
router.post("/update/:id", upload.single("file"), updateStudyMaterial);

// Delete study material
router.post("/delete/:id", deleteStudyMaterial);

module.exports = router;
