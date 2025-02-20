const Class = require('../../../models/school/classModel'); // Ensure correct path
const Subject = require('../../../models/school/subjectModel');

exports.ShowClasses = async (req, res) => {
    try {
        console.log(req.query);
        const { schoolName, classNumber } = req.query;

        if (!schoolName) {
            return res.status(400).send("School name is required");
        }

        if (!classNumber) {
            const classes = await Class.find({ schoolName }).select('classNumber');

            if (!classes.length) {
                return res.status(404).send("No classes found for this school");
            }

            return res.render('school/dashboard/showClasses', { classes });
        } else {
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


exports.ShowTeachers = async (req, res) => {
    try {
        console.log(req.query);
        const { schoolName, classNumber } = req.query;

        if (!schoolName) {
            return res.status(400).send("School name is required");
        }

        if (!classNumber) {
            const classes = await Subject.find({ schoolName }).select('classNumber');

            if (!classes.length) {
                return res.status(404).send("No classes found for this school");
            }

            return res.render('school/dashboard/showClasses', { classes });
        } else {
            console.log(`Fetching teachers for School: ${schoolName}, Class: ${classNumber}`);
            const subjects = await Subject.find({ schoolName, classNumber });

            console.log("Subjects Found:", subjects);

            if (!subjects.length) {
                console.log("No subjects found for this class.");
                return res.status(404).send("No teachers found for this class.");
            }

            let teachersMap = new Map();

            subjects.forEach(subject => {
                console.log(`Processing Subject: ${subject.name}`);
                console.log(`Teacher Emails for ${subject.name}:`, subject.teacherEmails);

                if (!subject.teacherEmails || subject.teacherEmails.length === 0) {
                    console.log(`No teachers found for subject: ${subject.name}`);
                    return;
                }

                subject.teacherEmails.forEach((teacher, index) => {
                    console.log(`Processing Teacher ${index + 1}:`, teacher);

                    if (!teachersMap.has(teacher.email)) {
                        teachersMap.set(teacher.email, {
                            teacherName: teacher.teacherName,
                            email: teacher.email,
                            subjects: [subject.name]
                        });
                    } else {
                        teachersMap.get(teacher.email).subjects.push(subject.name);
                    }
                });
            });

            const teachers = Array.from(teachersMap.values());
            console.log("Final Teachers List:", teachers);

            return res.render('school/dashboard/showTeachers', { teachers });
        }
    } catch (error) {
        console.error("Error in ShowTeachers:", error);
        res.status(500).send("Internal Server Error");
    }
};




exports.UpdateTeacher = async (req, res) => {
    try {
        const { teacherEmail, teacherName, newSubjects } = req.body;

        if (!teacherEmail || !teacherName || !newSubjects) {
            return res.status(400).json({ message: "All fields are required." });
        }

        console.log(`Updating teacher ${teacherEmail} to ${teacherName}, Subjects: ${newSubjects}`);

        const subjectsArray = newSubjects.split(',').map(sub => sub.trim());

        
        const subjects = await Subject.find({ "teacherEmails.email": teacherEmail });

        if (!subjects.length) {
            return res.status(404).json({ message: "Teacher not found in any subject." });
        }

        await Promise.all(subjects.map(async (subject) => {
            let teacherIndex = subject.teacherEmails.findIndex(t => t.email === teacherEmail);
            if (teacherIndex !== -1) {
                subject.teacherEmails[teacherIndex].teacherName = teacherName;
                subject.teacherEmails[teacherIndex].email = teacherEmail;
                await subject.save();
            }
        }));

        res.json({ message: "Teacher updated successfully!" });
    } catch (error) {
        console.error("Error updating teacher:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
