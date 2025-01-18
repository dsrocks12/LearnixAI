const User = require('../../models/User');
const SuperAdmin = require('../../models/superAdmin/superAdmin');

const bcrypt = require('bcrypt');


exports.SchoolLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the school admin by email
        const check = await SuperAdmin.findOne({ SchoolEmail: email });

        if (check) {
            // Compare the entered password with the stored password
            if (check.SchoolPassword == password) {
                // Render the onboarding page if login is successful
                res.render('school/onboarding/onboarding1');
            } else {
                res.status(401).send("Wrong password");
            }
        } else {
            res.status(404).send('Please SignUp with us to start');
        }
    } catch (err) {
        // Log and send internal server error if something goes wrong
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};















