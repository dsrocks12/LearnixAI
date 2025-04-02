const SuperAdmin = require('../../models/superAdmin/superAdmin');
const Class = require('../../models/school/classModel'); // Import Class model

exports.SchoolLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the school admin by email
        const check = await SuperAdmin.findOne({ SchoolEmail: email });

        if (!check) {
            return res.status(404).send('Please SignUp with us to start');
        }

        // Check if the entered password matches the stored password
        if (check.SchoolPassword !== password) {
            return res.status(401).send("Wrong password");
        }

        // Extract school name
        const schoolName = check.name;

        // Check if a class exists for the school
        const existingClass = await Class.findOne({ schoolName });

        if (existingClass) {
            // Redirect to dashboard if class exists
            return res.redirect(`/school/dashboard?schoolName=${encodeURIComponent(schoolName)}`);
        } else {
            // Render onboarding if no class exists
            return res.render('school/onboarding/onboarding1', { name: check.name });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
