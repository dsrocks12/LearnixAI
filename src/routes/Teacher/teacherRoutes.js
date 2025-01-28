const express = require('express');
const router = express.Router();
const { loginTeacher } = require('../../controllers/auth/teacherAuth'); 

router.post('/login', loginTeacher);

module.exports = router;








