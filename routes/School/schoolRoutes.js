const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { onboarding1, onboarding2, onboarding3, onboarding4 } = require('../../controllers/school/onboarding/onboardingController');
console.log("Before importing controllers...");

console.log("After importing controllers...");
const SuperAdmin = require('../../models/superAdmin/superAdmin'); // Ensure correct path
const { ShowClasses, ShowTeachers, UpdateTeacher, UpdateStudent } = require('../../controllers/school/dashboard/dashboardController');
//const {ShowTeachers}=require('../../controllers/school/dashboard/showTeacher');
// Debug: Verify the imported functions


// -------------------------------- Onboarding Routes --------------------------------

router.get('/onboarding', (req, res) => {
    res.render('school/onboarding/onboarding1');  // Correct relative path
});

router.get('/onboarding/2', (req, res) => {
    res.render('school/onboarding/onboarding2');
});

router.get('/onboarding/3', (req, res) => {
    res.render('school/onboarding/onboarding3');
});

router.get('/onboarding/4', (req, res) => {
    res.render('school/onboarding/onboarding4');
});

router.get('/dashboard', (req, res) => {
    res.render('school/dashboard/dashboard');
});

// POST routes for onboarding
router.post('/onboarding', authController.SchoolLogin);
router.post('/onboarding/2', onboarding1);
router.post('/onboarding/3', onboarding2);
router.post('/onboarding/4', onboarding3);
router.post('/onboarding/5', onboarding4);

// --------------------------------SCHOOL Dashboard Routes --------------------------------
router.get('/students', ShowClasses);
router.get('/teachers',ShowTeachers);

//Teacher ke updation ka route lawde

router.post('/update', UpdateTeacher);
router.post('/update/student', UpdateStudent);


// -------------------------------- Fetch All Schools Route --------------------------------

router.get('/api/schools', async (req, res) => {
    try {
        const schools = await SuperAdmin.find({}, { name: 1, region: 1, _id: 0 });

        if (!schools || schools.length === 0) {
            return res.status(404).json({ message: "No schools found" });
        }

        res.json({ schools });
    } catch (error) {
        console.error("Error fetching schools:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
console.log("Imported getTeacherDashboard:", typeof getTeacherDashboard);
console.log("Imported getTeacherDashboard:", typeof getStudentDashboard);
module.exports = router;