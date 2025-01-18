const express = require('express');

const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { onboarding1, onboarding2, onboarding3, onboarding4 } = require('../../controllers/onboarding/onboardingController');

router.get('/onboarding', (req, res) => {
    res.render('school/onboarding/onboarding1');  // Correct relative path
});

router.get('/onboarding/2',(req,res)=>{
    res.render('/school/onboarding/onboarding2');
});

router.get('/onboarding/3',(req,res)=>{
    res.render('/school/onboarding/onboarding3');

});
router.get('/onboarding/3',(req,res) =>{
    res.render('/school/onboarding/onboarding4');
})

router.post('/onboarding',authController.SchoolLogin);
router.post('/onboarding/2',onboarding1 );
router.post('/onboarding/3',onboarding2);
router.post('/onboarding/4', onboarding3);
router.post('/onboarding/5',onboarding4,)



module.exports = router;
