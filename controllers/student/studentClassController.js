const Assignment = require("../../models/teacherDashboard/assignmentModel");
const Announcement = require("../../models/teacherDashboard/announcementModel");
const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const Subject = require("../../models/school/subjectModel");
const Submission = require("../../models/teacherDashboard/submissionModel");
const Class = require('../../models/school/classModel');
const mongoose = require('mongoose');
const Event = require("../../models/teacherDashboard/eventModel"); // Import Event Model
const StudentModel = require("../../models/student/studentModel");


const getStudentClassDashboard = async (req, res) => {
    try {
        const { subjectId, emailId } = req.params;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.error(`Subject not found for ID: ${subjectId}`);
            return res.status(404).json({ message: "Subject not found." });
        }

        // Fetch student details from the database using student email
        const student = await StudentModel.findOne({ email: emailId }); // Use emailId here
        if (!student) {
            console.error(`Student not found for email: ${emailId}`);
            return res.status(404).json({ message: "Student not found." });
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

        // ✅ Fetch Events for the Student's Class
        const events = await Event.find({
            classNumber: formattedClassNumber,
            subjectName: { $regex: new RegExp(`^${subjectName}$`, "i") }
        }).sort({ dueDate: -1 });
        

        return res.render("student/classDashboard", {
            subjectId,
            subjectName,
            teacherName,
            announcements,
            assignments,
            studyMaterials,
            events,
            student
        });
    } catch (error) {
        console.error("Error fetching student class dashboard:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
const postAssignment = async (req, res) => {
    try {
        console.log(req.body);
        // Step 1: Extract subjectId from URL
        const subjectId = req.params.subjectId; // Assuming subjectId is passed as a URL param
        const studentEmail = req.body.email;
        console.log("Subject ID:", subjectId);
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            console.log(subjectId);
            return res.status(400).json({ message: "Invalid subject ID" });
        }

        // Step 2: Fetch schoolName and classNumber from the Subject model
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        const { schoolName, classNumber } = subject;

        // Step 3: Find the class with the same schoolName and classNumber
        const classData = await Class.findOne({ schoolName, classNumber });
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }
        
        // Step 4: Fetch student details (assuming student's email is from authenticated session)
        console.log("Student Email:", studentEmail);
        const student = classData.studentDetails.find(s => s.email === studentEmail);
        if (!student) {
            return res.status(404).json({ message: "Student not found in class" });
        }
        const studentName = student.studentName;

        // Format classNumber: if it's "Class 1", extract "1"
        const formattedClassNumber = classNumber.replace(/^Class\s*/i, '');
        console.log("Formatted Class Number:", formattedClassNumber);

        // Step 5: Handle file upload
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        // Store file paths (Assuming req.files is populated by multer middleware)
        const submissionFiles = req.files.map(file => file.path);

        // Step 6: Save submission to database with formattedClassNumber
        const newSubmission = new Submission({
            assignmentId: req.body.assignmentId,  // Assuming assignmentId is sent in form data
            studentEmail,
            studentName,
            classNumber: formattedClassNumber,
            subject: subject.name,
            submissionFiles
        });

        await newSubmission.save();

        // Step 7: Send success response
        res.status(200).json({ message: "Assignment submitted successfully!" });

    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ message: "Error submitting assignment" });
    }
};

module.exports = { getStudentClassDashboard, postAssignment };
