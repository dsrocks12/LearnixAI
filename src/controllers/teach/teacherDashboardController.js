const TeacherModel = require("../../models/teacher/teacherModel");
const Subject = require("../../models/school/subjectModel");
const Class = require("../../models/school/classModel");
const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Submission = require("../../models/teacherDashboard/submissionModel");
const path = require("path"); 

console.log("teacherDashboardController.js file is executing...");

const getTeacherDashboard = async (req, res) => {
    try {
        console.log("📌 getTeacherDashboard function STARTED...");

        const { email } = req.query;
        console.log("📨 Received Request with email:", email);

        if (!email) {
            console.error("❌ Missing email parameter in request");
            return res.status(400).json({ message: "❌ Teacher Email is required" });
        }

        const teacher = await TeacherModel.findOne({ email });
        console.log("🔍 Teacher Query Result:", teacher);

        if (!teacher) {
            console.error("Teacher Not Found for email:", email);
            return res.status(404).json({ message: "❌ Teacher Not Found" });
        }

        console.log(`✅ Teacher Found: ${teacher.name}, Email: ${teacher.email}`);

  
        const subjects = await Subject.find({ teacherEmail: teacher.email });
        console.log(`📚 Subjects Found: ${subjects.length}`, subjects);

    
        const classData = await Promise.all(subjects.map(async (subject) => {
            console.log("🔄 Fetching class data for subject:", subject.name);
            const classDetails = await Class.findOne({
                schoolName: teacher.schoolName,
                classNumber: subject.classNumber
            });

            return {
                classNumber: subject.classNumber,
                subjectName: subject.name,
                students: classDetails ? classDetails.studentDetails : []
            };
        }));

        console.log(`🏫 Classes Retrieved: ${classData.length}`, classData);


        const assignments = await Assignment.find({ teacherEmail: teacher.email });
        const announcements = await Announcement.find({ teacherEmail: teacher.email });
        const studyMaterials = await StudyMaterial.find({ teacherEmail: teacher.email });
        const submissions = await Submission.find({ teacherEmail: teacher.email });

        console.log(`📝 Assignments: ${assignments.length}, 📢 Announcements: ${announcements.length}, 📂 Study Materials: ${studyMaterials.length}, 📥 Submissions: ${submissions.length}`);

      
        const viewPath = path.join(__dirname, "../../views/teacher/dashboard.ejs");
        console.log("🛠 Checking EJS file at:", viewPath);

        return res.render("teacher/dashboard", {
            teacher: {
                name: teacher.name,
                email: teacher.email,
                schoolName: teacher.schoolName,
                region: teacher.region
            },
            classes: classData,
            assignments,
            announcements,
            studyMaterials,
            submissions
        });

    } catch (error) {
        console.error("❌ Error fetching teacher dashboard:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


console.log("Exporting getTeacherDashboard function:", typeof getTeacherDashboard);

module.exports = { getTeacherDashboard };
