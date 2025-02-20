const TeacherModel = require("../../models/teacher/teachermodel");
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
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "❌ Teacher Email is required" });
        }

        const teacher = await TeacherModel.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: "❌ Teacher Not Found" });
        }

        // Fetch subjects where the teacher's email is inside teacherEmails array
        const subjects = await Subject.find({ 
            teacherEmails: { $elemMatch: { email: teacher.email } }
        });

        // Group subjects by classNumber
        const classDataMap = new Map();

        for (const subject of subjects) {
            const classNumber = subject.classNumber;

            if (!classDataMap.has(classNumber)) {
                classDataMap.set(classNumber, {
                    classNumber: classNumber,
                    subjects: [],
                    students: []
                });
            }

            classDataMap.get(classNumber).subjects.push(subject.name);

            if (classDataMap.get(classNumber).students.length === 0) {
                const classDetails = await Class.findOne({
                    schoolName: teacher.schoolName,
                    classNumber: classNumber
                });

                if (classDetails) {
                    classDataMap.get(classNumber).students = classDetails.studentDetails || [];
                }
            }
        }

        const classData = Array.from(classDataMap.values());

        const assignments = await Assignment.find({ teacherEmail: teacher.email });
        const announcements = await Announcement.find({ teacherEmail: teacher.email });
        const studyMaterials = await StudyMaterial.find({ teacherEmail: teacher.email });
        const submissions = await Submission.find({ teacherEmail: teacher.email });

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


module.exports = { getTeacherDashboard };
