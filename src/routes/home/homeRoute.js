const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('home/home');  
});

router.get('/SchoolLogin', (req, res) => {
    res.render('auth/SchoolLogin');  
});


router.get('/TeacherLogin', (req, res) => {
    res.render('auth/TeacherLogin');  
});

router.get('/StudentLogin', (req, res) => {
    res.render('auth/StudentLogin'); 
});



module.exports = router;
