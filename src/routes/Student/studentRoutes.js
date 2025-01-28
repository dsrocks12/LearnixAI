const express=require('express');
const router = express.Router();

const { loginStudent } = require('../../controllers/auth/studentAuth'); 

router.post('/login', loginStudent);

module.exports = router;
