const express = require("express");
const router = express.Router();


const { getStudentDashboard } = require("../controllers/student/studentDashboardController"); 


console.log("🛠️ Imported getStudentDashboard:", typeof getStudentDashboard);

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


console.log(" Student Dashboard Router Loaded Successfully");

module.exports = router;
