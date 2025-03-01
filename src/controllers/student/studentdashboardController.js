const StudentModel = require("../../models/student/studentModel");
const Subject = require("../../models/school/subjectModel");
const Class = require("../../models/school/classModel");
const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Submission = require("../../models/teacherDashboard/submissionModel");

console.log("Student Controller Loaded");

const getStudentDashboard = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: " Student Email is required" });
        }

        const student = await StudentModel.findOne({ email }).lean();

        if (!student) {
            return res.status(404).json({ message: "Student Not Found" });
        }

        console.log(`Student Found: Email: ${student.email}`);

        
        const classes = await Class.find({ studentDetails: { $elemMatch: { email: student.email } } }).lean();

        if (!classes.length) {
            console.log("No Classes Found for Student");
            return res.render("student/dashboard", {
                student: {
                    email: student.email,
                    schoolName: student.schoolName,
                    region: student.region
                },
                subjects: [],
                assignments: [],
                announcements: [],
                studyMaterials: [],
                submissions: []
            });
        }

        console.log("📚 Student is Enrolled in Classes:", classes.map(cls => cls.classNumber));

       
        const subjects = await Subject.find({
            classNumber: { $in: classes.map(classData => classData.classNumber) },
            schoolName: student.schoolName
        }).lean();

        console.log("📚 Raw Subjects Data from DB:", JSON.stringify(subjects, null, 2));

        
        const subjectMap = new Map();
        subjects.forEach(subject => {
            if (!subjectMap.has(subject.name) || (subject.teacherEmails && subject.teacherEmails.length)) {
                subjectMap.set(subject.name, subject);
            }
        });

        const uniqueSubjects = Array.from(subjectMap.values());

      
        const subjectsWithTeachers = uniqueSubjects.map(subject => {
            console.log("📢 Subject:", subject.name, "Raw Teacher Data:", subject.teacherEmails);
        
            const teacherNames = (subject.teacherEmails && subject.teacherEmails.length)
                ? subject.teacherEmails.map(t => t.teacherName).join(", ") 
                : "No Teacher Assigned";
        
            return {
                id: subject._id,
                name: subject.name,
                teacherNames: teacherNames  
            };
        });
        

        

        
        const [assignments, announcements, studyMaterials, submissions] = await Promise.all([
            Assignment.find({ studentId: student._id }).lean(),
            Announcement.find({ schoolName: student.schoolName }).lean(),
            StudyMaterial.find({ schoolName: student.schoolName }).lean(),
            Submission.find({ studentId: student._id }).lean()
        ]);

        console.log(`📝 Assignments Found: ${assignments.length}`);
        console.log(`📢 Announcements Found: ${announcements.length}`);
        console.log(`📚 Study Materials Found: ${studyMaterials.length}`);
        console.log(`📩 Submissions Found: ${submissions.length}`);

        
        console.log("🚀 Final Data Sent to Frontend:", {
            student: {
                email: student.email,
                schoolName: student.schoolName,
                region: student.region
            },
            subjects: subjectsWithTeachers,
            assignments,
            announcements,
            studyMaterials,
            submissions
        });

        return res.render("student/dashboard", {
            student: {
                
                schoolName: student.schoolName,
                region: student.region
            },
            subjects: subjectsWithTeachers,
            assignments,
            announcements,
            studyMaterials,
            submissions
        });

    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {getStudentDashboard};