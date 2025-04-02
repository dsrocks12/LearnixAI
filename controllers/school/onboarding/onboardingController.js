const Subject = require('../../../models/school/subjectModel');
const Class = require('../../../models/school/classModel'); // Import the Class model
const SuperAdmin = require('../../../models/superAdmin/superAdmin'); // Import SuperAdmin model
const Teacher = require('../../../models/teacher/teachermodel');
const Student = require("../../../models/student/studentModel"); // Replace with the correct path





exports.onboarding1 = async (req, res) => {
    // console.log(req.body);

    // Destructure using correct keys from req.body
    const { name, selectedClasses } = req.body;

    // console.log('Selected Classes:', selectedClasses); // Debug: Log selected classes
    // console.log('Name:', name); // Debug: Log name

    // Render 'onboarding2' and send both 'selectedClasses' and 'name' to the next page
    res.render('school/onboarding/onboarding2', { selectedClasses, name });
};




exports.onboarding2 = async (req, res) => {
    try {
        // console.log(req.body); // Log the incoming data for debugging
        const rawData = req.body; // Incoming data from the form
        const transformedData = {}; // Initialize the transformed data structure
        const { name, selectedClasses, subjects } = rawData; // Extract required fields

        // Parse selectedClasses string into an array (if necessary)
        const selectedClassesArray = JSON.parse(selectedClasses);

        // Transform raw data into the required structure
        for (const className of selectedClassesArray) {
            if (subjects[className]) {
                transformedData[className] = subjects[className]; // Map subjects to corresponding classes
            } else {
                transformedData[className] = []; // Ensure the class exists even if no subjects are selected
            }
        }

        // console.log("Transformed Data:", transformedData); // Debug: Verify the final structure
        // console.log(selectedClassesArray);
        // console.log(name);
        // Pass all the data to the next page
        res.render('school/onboarding/onboarding3', {
            name: name,
            selectedClasses: selectedClassesArray,
            subjects: transformedData
        });
    } catch (error) {
        console.error("Error in onboarding2 controller:", error);
        res.status(500).send("An error occurred while processing the data.");
    }
};


exports.onboarding3 = async (req, res) => {
    try {
        const { name, teachers } = req.body;

        // Fetch the school region from SuperAdmin
        const schoolData = await SuperAdmin.findOne({ name: name });
        if (!schoolData) {
            return res.status(404).send('School not found');
        }
        const region = schoolData.region;

        // Process and save teachers
        const processedSubjects = new Set();
        const selectedClasses = new Set();

        for (const key in teachers) {
            const match = key.match(/^(.+?)_(.+?)$/);
            if (match) {
                const className = match[1];
                const subjectName = match[2];
                const teacherEmails = teachers[key].email;
                const teacherNames = teachers[key].name;
                const teacherPasswords = teachers[key].password;

                selectedClasses.add(className);

                const uniqueKey = `${className}_${subjectName}`;

                if (!processedSubjects.has(uniqueKey)) {
                    processedSubjects.add(uniqueKey);

                    // Save subject entry
                    const teacherData = teacherEmails.map((email, index) => ({
                        email,
                        teacherName: teacherNames[index],
                    }));

                    const subject = new Subject({
                        schoolName: name,
                        classNumber: className,
                        name: subjectName,
                        teacherEmails: teacherData,
                    });

                    await subject.save();
                }

                // Save teachers into the Teacher model
                for (let i = 0; i < teacherEmails.length; i++) {
                    const existingTeacher = await Teacher.findOne({ email: teacherEmails[i] });
                    if (!existingTeacher) {
                        const newTeacher = new Teacher({
                            schoolName: name,
                            region: region,
                            email: teacherEmails[i],
                            password: teacherPasswords[i], // Password stored as plain text (not recommended for production)
                        });

                        await newTeacher.save();
                    }
                }
            }
        }

        res.render('school/onboarding/onboarding4', {
            name: name,
            selectedClasses: Array.from(selectedClasses),
            teachers: teachers,
        });

    } catch (error) {
        console.error('Error saving teachers:', error);
        res.status(500).send('An error occurred while saving teachers.');
    }
};

exports.onboarding4 = async (req, res) => {
    try {
        console.log(req.body);

        const { students, name: schoolName } = req.body;

        if (!schoolName || typeof schoolName !== "string" || schoolName.trim() === "") {
            console.error("School Name is required and must be a valid string");
            return res.status(400).send("School Name is required and must be a valid string.");
        }

        if (!students || typeof students !== "object" || Object.keys(students).length === 0) {
            console.error("Students data is invalid or missing");
            return res.status(400).send("Students data must be provided.");
        }

        // Fetch the region based on schoolName from SuperAdmin
        const superAdmin = await SuperAdmin.findOne({ name: schoolName.trim() });

        if (!superAdmin) {
            console.error("No school found with the given name");
            return res.status(404).send("No school found with the given name.");
        }

        const schoolRegion = superAdmin.region;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const studentDocuments = [];
        const classDocuments = [];

        for (const [classNumber, classData] of Object.entries(students)) {
            if (
                !classNumber ||
                typeof classNumber !== "string" ||
                !classData ||
                typeof classData !== "object" ||
                !Array.isArray(classData.emails) ||
                classData.emails.length === 0 ||
                !Array.isArray(classData.names) ||
                classData.names.length !== classData.emails.length ||
                !Array.isArray(classData.passwords) ||
                classData.passwords.length !== classData.emails.length
            ) {
                console.warn(`Invalid data for class: ${classNumber}`);
                continue;
            }

            const classStudentDetails = [];

            for (let i = 0; i < classData.emails.length; i++) {
                const email = classData.emails[i].trim();
                const studentName = classData.names[i].trim();
                const password = classData.passwords[i].trim();

                if (!emailRegex.test(email)) {
                    console.warn(`Invalid email: ${email} for class: ${classNumber}`);
                    continue;
                }

                // Prepare student data for Student collection
                studentDocuments.push({
                    schoolName: schoolName.trim(),
                    region: schoolRegion, // Use region from SuperAdmin
                    email,
                    password,
                });

                // Prepare student details for Class collection
                classStudentDetails.push({
                    email,
                    studentName,
                });
            }

            if (classStudentDetails.length > 0) {
                classDocuments.push({
                    schoolName: schoolName.trim(),
                    classNumber: classNumber.trim(),
                    studentDetails: classStudentDetails,
                });
            }
        }

        // Save student login details into Student collection
        if (studentDocuments.length > 0) {
            try {
                await Student.insertMany(studentDocuments);
                console.log(`Saved ${studentDocuments.length} students successfully.`);
            } catch (err) {
                console.error("Error saving students:", err);
                return res.status(500).send("Failed to save students.");
            }
        }

        // Save student details into Class collection
        if (classDocuments.length > 0) {
            try {
                await Class.insertMany(classDocuments);
                console.log(`Saved ${classDocuments.length} classes successfully.`);
            } catch (err) {
                console.error("Error saving class details:", err);
                return res.status(500).send("Failed to save class details.");
            }
        }

        if (studentDocuments.length === 0 && classDocuments.length === 0) {
            console.warn("No valid students to save.");
            return res.status(400).send("No valid students to save.");
        }

        res.redirect(`/school/dashboard?schoolName=${encodeURIComponent(schoolName)}`);
    } catch (error) {
        console.error("Error in onboarding4:", error);
        res.status(500).send("Internal Server Error");
    }
};
