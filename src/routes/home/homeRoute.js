const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('home/home');  // Render home.ejs when '/' is accessed
});

router.get('/SchoolLogin', (req, res) => {
    res.render('auth/SchoolLogin');  // This will render views/auth/SchoolLogin.ejs
});






module.exports = router;
