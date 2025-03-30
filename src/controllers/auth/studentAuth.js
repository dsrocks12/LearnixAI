const Student = require('../../models/student/studentModel');  // ✅ Correct Path

const loginStudent = async (req, res) => {
    try {
        // console.log(" Incoming Request Body:", req.body);

        const { selectedSchool, email, password } = req.body;

        if (!selectedSchool || !email || !password) {
            // console.log("❌ Missing Fields:", { selectedSchool, email, password });
            return res.status(400).json({ message: "All fields are required: selectedSchool, email, and password." });
        }

        const [schoolName, region] = selectedSchool.split('|');

        // console.log("🔍 Parsed School Data:", { schoolName, region });

        if (!schoolName || !region) {
            return res.status(400).json({ message: "Invalid school selection format." });
        }

        // console.log("Query Parameters:", { schoolName, region, email });

        const student = await Student.findOne({ schoolName, region, email });

        if (!student) {
            // console.log("❌ Student Not Found.");
            return res.status(400).json({ message: "Student Not Found." });
        }

        // Direct password comparison (Not recommended for production, but as per your request)
        if (password !== student.password) {
            // console.log("❌ Invalid Credentials.");
            return res.status(400).json({ message: "Invalid Credentials." });
        }

        // console.log("✅ Student Login Successful.");

        // Encode the email for use in the URL
        const encodedEmail = encodeURIComponent(student.email);

        // Redirect URL with encoded email
        const redirectUrl = `http://localhost:15000/student/dashboard?email=${encodedEmail}`;

        return res.status(200).json({
            message: "✅ Student Login Successful.",
            userId: student._id,
            role: 'student',
            redirect: redirectUrl // Pass the redirect URL with email
        });

    } catch (error) {
        console.error("❌ Error Logging in:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports = { loginStudent };
