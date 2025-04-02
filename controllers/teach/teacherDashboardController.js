const TeacherModel = require("../../models/teacher/teachermodel");
const Subject = require("../../models/school/subjectModel");
const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Submission = require("../../models/teacherDashboard/submissionModel");

console.log("TeacherDashboardController.js file is executing...");

const getTeacherDashboard = async (req, res) => {
    try {
        const { email } = req.query;
      

        if (!email) {
            console.log("Missing teacher email in request");
            return res.status(400).json({ message: " Teacher Email is required" });
        }

       
        const teacher = await TeacherModel.findOne({ email: new RegExp(`^${email}$`, "i") });

        if (!teacher) {
            console.log(" Teacher not found in database.");
            return res.status(404).json({ message: " Teacher Not Found" });
        }

        console.log("🔍 Teacher lookup result:", teacher);

       
        const subjects = await Subject.find({ 
            schoolName: teacher.schoolName, 
            "teacherEmails.email": { $regex: new RegExp(`^${email}$`, "i") } 
        });

        console.log("📚 Subjects found for teacher:", subjects);

       
        const classDataMap = new Map();

for (const subject of subjects) {
   
    const cleanClassNumber = subject.classNumber.replace(/class\s*/i, "").trim(); 

    if (!classDataMap.has(cleanClassNumber)) {
        classDataMap.set(cleanClassNumber, {
            classNumber: cleanClassNumber, 
            subjects: [],
        });
    }
    classDataMap.get(cleanClassNumber).subjects.push(subject.name);
}


        const classData = Array.from(classDataMap.values());
        console.log("📊 Final processed class data:", classData);

        
        console.log("🕵️ Fetching teacher-related dashboard data...");
        const [assignments, announcements, studyMaterials, submissions] = await Promise.all([
            Assignment.find({ teacherEmail: teacher.email }),
            Announcement.find({ teacherEmail: teacher.email }),
            StudyMaterial.find({ teacherEmail: teacher.email }),
            Submission.find({ teacherEmail: teacher.email })
        ]);

        console.log("Assignments found:", assignments.length);
        console.log("Announcements found:", announcements.length);
        console.log("Study Materials found:", studyMaterials.length);
        console.log("Submissions found:", submissions.length);

        
        return res.render("teacher/dashboard", {
            teacher: {
                name: teacher.name || "Unknown",
                email: teacher.email,
                schoolName: teacher.schoolName || "Unknown School",
                region: teacher.region || "Unknown Region",
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

module.exports = { getTeacherDashboard };
