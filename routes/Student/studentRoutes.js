const express = require('express');
const router = express.Router();
const { loginStudent } = require('../../controllers/auth/studentAuth'); 
const { getStudentDashboard } = require('../../controllers/student/studentDashboardController');




router.get('/login', (req, res) => {
    console.log("🔍 Rendering Student Login Page");
    res.render('auth/StudentLogin');
});

router.post('/login', loginStudent);


router.get('/dashboard', getStudentDashboard);

module.exports = router;
