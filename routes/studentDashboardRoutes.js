const express = require("express");
const router = express.Router();
const multer  = require('multer');

const { getStudentDashboard } = require("../controllers/student/studentDashboardController"); 
const { getStudentClassDashboard,postAssignment } = require("../controllers/student/studentClassController");

const upload = multer({ dest: 'uploads/' });
console.log(" Imported getStudentDashboard:", typeof getStudentDashboard);

if (typeof getStudentDashboard !== "function") {
    throw new Error(" getStudentDashboard is not a function. Check its export in studentDashboardController.js.");
}


router.get("/", async (req, res, next) => {
    try {
        await getStudentDashboard(req, res);
    } catch (error) {
        console.error("Error in /student/dashboard route:", error);
        next(error); 
    }
});

router.get("/subject/:subjectId/:emailId", getStudentClassDashboard);
router.post("/subject/submit/:subjectId",upload.array('submissionFiles'),postAssignment);    
console.log(" Student Dashboard Router Loaded Successfully");


module.exports = router;
