const Class = require('../../../models/school/classModel'); // Ensure correct path

exports.ShowClasses = async (req, res) => {
    try {
        const { schoolName, classNumber } = req.query;

        if (!schoolName) {
            return res.status(400).send("School name is required");
        }

        if (!classNumber) {
            // Case 1: Only schoolName is provided -> Show list of classes
            const classes = await Class.find({ schoolName }).select('classNumber');

            if (!classes.length) {
                return res.status(404).send("No classes found for this school");
            }

            return res.render('school/dashboard/showClasses', { classes });
        } else {
            // Case 2: Both schoolName and classNumber are provided -> Show students in that class
            const classData = await Class.findOne({ schoolName, classNumber }).select('studentDetails');

            if (!classData) {
                return res.status(404).send("No students found for this class in the given school");
            }

            return res.render('school/dashboard/showStudents', { students: classData.studentDetails });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
