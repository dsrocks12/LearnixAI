const express = require('express');
const router = express.Router();
const { loginTeacher } = require('../../controllers/auth/teacherAuth');




router.get('/login', (req, res) => {
    res.render('auth/TeacherLogin'); 
});


router.post('/login', loginTeacher);



module.exports = router; 