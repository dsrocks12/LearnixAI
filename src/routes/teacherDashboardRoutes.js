const express = require("express");
const router = express.Router();

const { getTeacherDashboard } = require("../controllers/teach/teacherDashboardController");

if (typeof getTeacherDashboard !== "function") {
    throw new Error("getTeacherDashboard is not a function. Check its export in teacherDashboardController.js.");
}

router.get("/", async (req, res, next) => {
    try {
        await getTeacherDashboard(req, res);
    } catch (error) {
        console.error("Error in /teacher/dashboard route:", error);
        next(error);
    }
});

module.exports = router;
