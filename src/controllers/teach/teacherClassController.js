const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Submission = require("../../models/teacherDashboard/submissionModel");
const Subject = require("../../models/school/subjectModel"); 
const getClassDashboard = async (req, res) => {
    try {
        let { classNumber, subjectName } = req.params;
        const { email } = req.query; 

        console.log(`📩 Fetching data for Class ${classNumber}, Subject: ${subjectName || "N/A"}, Teacher Email: ${email || "N/A"}`);

      
        if (!subjectName) {
            const subject = await Subject.findOne({ classNumber });

            if (!subject) {
                console.error(` No subject found for Class ${classNumber}`);
                return res.status(404).json({ message: "No subject found for this class." });
            }

            subjectName = subject.name; 
        }

        const assignments = await Assignment.find({ classNumber, subjectName });
        const announcements = await Announcement.find({ classNumber, subjectName });
        const studyMaterials = await StudyMaterial.find({ classNumber, subjectName });
        const submissions = await Submission.find({ classNumber, subjectName });

       
        return res.render("teacher/classDashboard", {
            classNumber,
            subjectName,
            assignments,
            announcements,
            studyMaterials,
            submissions,
            teacherEmail: email || ""  
        });

    } catch (error) {
        console.error("Error fetching class dashboard:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getClassDashboard };
