const express = require("express");


const { getTeacherDashboard } = require("../controllers/teach/teacherDashboardController");
const { getClassDashboard } = require("../controllers/teach/teacherClassController");
console.log("✅ Imported getTeacherDashboard:", getTeacherDashboard);
console.log("✅ Imported getClassDashboard:", getClassDashboard);
const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        await getTeacherDashboard(req, res);
    } catch (error) {
        console.error("Error in /teacher/dashboard route:", error);
        next(error);
    }
});

// Route for class-specific dashboard

router.get("/class/:classNumber/:subjectName", getClassDashboard);


module.exports = router;
