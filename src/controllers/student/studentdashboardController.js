const StudentModel = require("../../models/student/studentModel");
const Subject = require("../../models/school/subjectModel");
const Class = require("../../models/school/classModel");
const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Submission = require("../../models/teacherDashboard/submissionModel");
const path = require("path"); // Import path module for debugging

console.log("Student controller loaded");

const getStudentDashboard = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "❌ Student Email is required" });
        }

        const student = await StudentModel.findOne({ email });

        if (!student) {
            return res.status(404).json({ message: "❌ Student Not Found" });
        }

        console.log(`✅ Student Found: ${student.name}, Email: ${student.email}`);

        // Fetch subjects assigned to the student based on the class they're enrolled in
        const classes = await Class.find({ studentDetails: { $elemMatch: { email: student.email } } });
        const subjects = await Subject.find({
            classNumber: { $in: classes.map(classData => classData.classNumber) }
        });

        console.log(`📚 Subjects Found: ${subjects.length}`);

        // ✅ Fetch Assignments, Announcements, Study Material, and Submissions for the student
        const assignments = await Assignment.find({ studentId: student._id }) || [];
        const announcements = await Announcement.find({ schoolName: student.schoolName }) || [];
        const studyMaterials = await StudyMaterial.find({ schoolName: student.schoolName }) || [];
        const submissions = await Submission.find({ studentId: student._id }) || [];

        console.log(`📝 Assignments Found: ${assignments.length}`);
        console.log(`📢 Announcements Found: ${announcements.length}`);
        console.log(`📚 Study Materials Found: ${studyMaterials.length}`);
        console.log(`📩 Submissions Found: ${submissions.length}`);

        // 🛠 Debug: Check if the dashboard view exists
        const viewPath = path.join(__dirname, "../../views/student/dashboard.ejs");
        console.log("🛠 Checking EJS file at:", viewPath);

        return res.render("student/dashboard", {
            student: {
                name: student.name,
                email: student.email,
                schoolName: student.schoolName,
                region: student.region
            },
            subjects,
            assignments,  // ✅ Pass assignments to EJS
            announcements, // ✅ Pass announcements to EJS
            studyMaterials, // ✅ Pass study materials to EJS
            submissions // ✅ Pass submissions to EJS
        });

    } catch (error) {
        console.error("❌ Error fetching student dashboard:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


module.exports = { getStudentDashboard };
