

const Subject = require("../../../models/school/subjectModel");

exports.teacher = async (req, res) => {
    try {
        const { schoolName } = req.query; // Extract schoolName from the request body
        
        if (!schoolName) {
            return res.status(400).json({ message: "School name is required" });
        }

        // Query to find subjects for the specific school
        const subjects = await Subject.find(
            { schoolName }, // Filter by schoolName
            { classNumber: 1, name: 1, teacherEmails: 1, schoolName: 1 } // Projection to include specific fields
        );

        if (subjects.length === 0) {
            return res.status(404).json({ message: `No subjects found for school: ${schoolName}` });
        }

        const data = {
            schoolName,
            teacherList: subjects.map(subject => ({
                classNumber: subject.classNumber,
                subjectName: subject.name,
                teacherEmails: subject.teacherEmails
            }))
        };
        res.render('school/dashboard/showTeacher', data);
    } catch (error) {
        console.error("Error fetching teacher data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
