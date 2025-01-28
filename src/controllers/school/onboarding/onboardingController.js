const Subject = require('../../../models/school/subjectModel');
const Class = require('../../../models/school/classModel'); // Import the Class model


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
        // Log the incoming request body for debugging
        // console.log(req.body);

        // Extract the school name and teacher data from the form
        const { name, teachers } = req.body;

        // Collect parsed subjects to avoid duplicates
        const processedSubjects = new Set();
        const selectedClasses = new Set();

        // Iterate over the teachers object to process each subject and class
        for (const key in teachers) {
            const match = key.match(/^(.+?)_(.+?)$/); // Match 'Class_Subject' format
            if (match) {
                const className = match[1]; // Extract the class name
                const subjectName = match[2]; // Extract the subject name
                const teacherEmails = teachers[key].email; // Get the teacher emails array
                const teacherNames = teachers[key].name; // Get the teacher names array

                // Add the class name to the set of selected classes
                selectedClasses.add(className);

                // Generate a unique identifier for class and subject
                const uniqueKey = `${className}_${subjectName}`;

                // Avoid duplicates by checking the processed subjects set
                if (!processedSubjects.has(uniqueKey)) {
                    processedSubjects.add(uniqueKey);

                    // Combine teacher emails and names into an array of objects
                    const teacherData = teacherEmails.map((email, index) => ({
                        email,
                        teacherName: teacherNames[index], // Match name by index
                    }));

                    // Create and save a new subject document
                    const subject = new Subject({
                        schoolName: name, // Add the school name
                        classNumber: className,
                        name: subjectName,
                        teacherEmails: teacherData, // Save teacher data (email + name)
                    });

                    // Save the subject document to the database
                    await subject.save();
                }
            }
        }

        // Convert the set of selected classes to an array
        const selectedClassesArray = Array.from(selectedClasses);

        // Pass the school name, selected classes, and teacher data to the next view
        res.render('school/onboarding/onboarding4', {
            name: name,
            selectedClasses: selectedClassesArray,
            teachers: teachers,
        });
    } catch (error) {
        console.error('Error saving subjects:', error);
        res.status(500).send('An error occurred while saving subjects.');
    }
};


exports.onboarding4 = async (req, res) => {
    try {
        console.log(req.body); // Log the request body for debugging

        const { students, name: schoolName } = req.body; // Destructure the request body

        // Validate school name
        if (!schoolName || typeof schoolName !== 'string' || schoolName.trim() === '') {
            console.error('School Name is required and must be a valid string');
            return res.status(400).send('School Name is required and must be a valid string.');
        }

        // Validate students object
        if (!students || typeof students !== 'object' || Object.keys(students).length === 0) {
            console.error('Students data is invalid or missing');
            return res.status(400).send('Students data must be provided.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const classDocuments = [];

        // Iterate over the students object and prepare classes
        for (const [classNumber, classData] of Object.entries(students)) {
            // Validate classData structure
            if (
                !classNumber ||
                typeof classNumber !== 'string' ||
                !classData ||
                typeof classData !== 'object' ||
                !Array.isArray(classData.emails) ||
                classData.emails.length === 0
            ) {
                console.warn(`Invalid data for class: ${classNumber}`);
                continue;
            }

            // Ensure the names and emails are aligned
            if (!Array.isArray(classData.names) || classData.names.length !== classData.emails.length) {
                console.warn(`Names and emails mismatch for class: ${classNumber}`);
                continue;
            }

            // Build the studentDetails array
            const studentDetails = classData.emails.map((email, index) => {
                return {
                    email: email.trim(),
                    studentName: classData.names[index].trim(),
                };
            });

            // Filter and validate emails
            const validEmails = studentDetails.filter(student => emailRegex.test(student.email));
            if (validEmails.length === 0) {
                console.warn(`No valid student emails for class: ${classNumber}`);
                continue;
            }

            classDocuments.push({
                schoolName: schoolName.trim(),
                classNumber: classNumber.trim(),
                studentDetails: validEmails, // Add the valid student details here
            });
        }

        // Save all valid classes in one batch
        if (classDocuments.length > 0) {
            try {
                await Class.insertMany(classDocuments);
                console.log(`Saved ${classDocuments.length} classes successfully.`);
                res.redirect(`/school/dashboard?schoolName=${encodeURIComponent(schoolName)}`);
            } catch (err) {
                console.error('Error saving classes:', err);
                res.status(500).send('Failed to save classes.');
            }
        } else {
            console.warn('No valid classes to save.');
            res.status(400).send('No valid classes to save.');
        }
    } catch (error) {
        console.error('Error in onboarding4:', error);
        res.status(500).send('Internal Server Error');
    }
};
