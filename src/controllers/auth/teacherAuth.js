const Teacher = require('../../models/teacher/teacherModel');

const loginTeacher = async (req, res) => {
    try {
        console.log("Incoming Request Body:", req.body);

        const { selectedSchool, email, password } = req.body;

        if (!selectedSchool || !email || !password) {
            console.log("Missing Fields:", { selectedSchool, email, password });
            return res.status(400).json({ message: "All fields are required: selectedSchool, email, and password." });
        }

        const [schoolName, region] = selectedSchool.split('|');

        console.log("Parsed School Data:", { schoolName, region });

        if (!schoolName || !region) {
            return res.status(400).json({ message: "Invalid school selection format." });
        }

        console.log("Query Parameters:", { schoolName, region, email });

        const teacher = await Teacher.findOne({ schoolName, region, email });

        if (!teacher) {
            console.log("Teacher Not Found.");
            return res.status(400).json({ message: "Teacher Not Found." });
        }

        if (password !== teacher.password) {
            console.log("Invalid Credentials.");
            return res.status(400).json({ message: "Invalid Credentials." });
        }

        console.log("Teacher Login Successful.");

        const encodedEmail = encodeURIComponent(teacher.email);
        const redirectUrl = `http://localhost:12000/teacher/dashboard?email=${encodedEmail}`;

        return res.status(200).json({
            message: "Teacher Login Successful.",
            userId: teacher._id,
            role: 'teacher',
            redirect: redirectUrl
        });

    } catch (error) {
        console.error("Error Logging in:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports = { loginTeacher };
