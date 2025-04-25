const express = require('express');
const router = express.Router();
const { loginStudent } = require('../../controllers/auth/studentAuth'); 
const { getStudentDashboard } = require('../../controllers/student/studentDashboardController');
const { getStudentClassDashboard } = require('../../controllers/student/studentClassController');
const { participateEvent } = require('../../controllers/teacherDashboard/eventController');

router.get('/login', (req, res) => {
    console.log("🔍 Rendering Student Login Page");
    res.render('auth/StudentLogin');
});

router.post('/login', loginStudent);


router.get('/dashboard', getStudentDashboard);
router.get('/dashboard/subject/:subjectId/:emailId', getStudentClassDashboard);

router.post('/events/participate/:eventId', participateEvent);

console.log("🛠️ Student Router Loaded Successfully");

module.exports = router;
