const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Subject = require("../../models/school/subjectModel");

const getStudentClassDashboard = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.error(`Subject not found for ID: ${subjectId}`);
            return res.status(404).json({ message: "Subject not found." });
        }

        const { classNumber, name: subjectName, teacherEmails } = subject;
        const teacherName = teacherEmails?.length ? teacherEmails[0].teacherName : "No Teacher Assigned";

        // Remove any non-numeric characters from the classNumber
        const formattedClassNumber = classNumber.replace(/\D/g, "");

        // Find announcements using classNumber and subjectName filter
        const announcements = await Announcement.find({
            classNumber: formattedClassNumber,
            subjectName: { $regex: new RegExp(`^${subjectName}$`, "i") }
        }).sort({ createdAt: -1 });

        // Find assignments by subjectId
        const assignments = await Assignment.find({
            classNumber: formattedClassNumber,  
            subject: { $regex: new RegExp(`^${subjectName}$`, "i") }  
        }).sort({ createdAt: -1 });
        
        
        console.log("Fetched Assignments:", assignments); // Debugging Line
        
        // Find study materials using classNumber and subjectName filter
        const studyMaterials = await StudyMaterial.find({
            classNumber: formattedClassNumber,
            subjectName: { $regex: new RegExp(`^${subjectName}$`, "i") }
        }).sort({ createdAt: -1 });

        return res.render("student/classDashboard", {
            subjectName,
            teacherName,
            announcements,
            assignments,
            studyMaterials
        });
    } catch (error) {
        console.error("Error fetching student class dashboard:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getStudentClassDashboard };
