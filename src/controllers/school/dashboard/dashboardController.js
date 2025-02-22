const Class = require('../../../models/school/classModel'); // Ensure correct path
const Subject = require('../../../models/school/subjectModel');
const Teacher = require('../../../models/teacher/teachermodel');
const Student = require('../../../models/student/studentModel')

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

            return res.render('school/dashboard/showClass', { classes });
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


exports.UpdateStudent = async (req, res) => {
    try {
        const { oldStudentName, oldStudentEmail, newStudentName, newStudentEmail } = req.body;

        if (!oldStudentName || !oldStudentEmail || !newStudentName || !newStudentEmail) {
            return res.status(400).json({ message: "All fields are required." });
        }

        console.log(`Updating student:
            Old Name: ${oldStudentName}, Old Email: ${oldStudentEmail}
            New Name: ${newStudentName}, New Email: ${newStudentEmail}`);

        // Find the class document that contains this student
        const studentClass = await Class.findOne({ "studentDetails.email": oldStudentEmail });

        if (!studentClass) {
            return res.status(404).json({ message: "Student not found in any class." });
        }

        // Update student details inside the class
        studentClass.studentDetails = studentClass.studentDetails.map(student => {
            if (student.email === oldStudentEmail && student.studentName === oldStudentName) {
                return { email: newStudentEmail, studentName: newStudentName };
            }
            return student;
        });

        await studentClass.save();

        // Update the Student model separately
        const updatedStudent = await Student.findOneAndUpdate(
            { email: oldStudentEmail },
            { email: newStudentEmail, studentName: newStudentName },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found in the Student model." });
        }

        res.json({ message: "Student updated successfully!" });

    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



exports.UpdateTeacher = async (req, res) => {
    try {
        const { 
            oldTeacherName, oldTeacherEmail, oldSubjects, 
            newTeacherName, newTeacherEmail, newSubjects 
        } = req.body;

        if (!oldTeacherName || !oldTeacherEmail || !oldSubjects || !newTeacherName || !newTeacherEmail || !newSubjects) {
            return res.status(400).json({ message: "All fields are required." });
        }

        console.log(`Updating teacher:
            Old Name: ${oldTeacherName}, Old Email: ${oldTeacherEmail}, Old Subject: ${oldSubjects}
            New Name: ${newTeacherName}, New Email: ${newTeacherEmail}, New Subject: ${newSubjects}`);

        // Find the subject document where this teacher exists
        const subject = await Subject.findOne({ 
            name: oldSubjects, 
            "teacherEmails.email": oldTeacherEmail,
            "teacherEmails.teacherName": oldTeacherName
        });

        if (!subject) {
            return res.status(404).json({ message: "Teacher not found in the specified subject." });
        }

        // Update the teacher's details in the `teacherEmails` array
        subject.teacherEmails = subject.teacherEmails.map(teacher => {
            if (teacher.email === oldTeacherEmail && teacher.teacherName === oldTeacherName) {
                return { email: newTeacherEmail, teacherName: newTeacherName };
            }
            return teacher;
        });
        subject.name = newSubjects;

        // Save the updated subject document
        await subject.save();

        // Now update the Teacher model
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { schoolName: subject.schoolName, email: oldTeacherEmail }, 
            { email: newTeacherEmail }, 
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: "Teacher not found in the Teacher model." });
        }

        res.json({ message: "Teacher updated successfully!" });

    } catch (error) {
        console.error("Error updating teacher:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
