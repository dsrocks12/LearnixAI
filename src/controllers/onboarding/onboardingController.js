const Subject = require('../../models/school/subjectModel');
const Class = require('../../models/school/classModel'); // Import the Class model


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
        // console.log(req.body); // Log the incoming request body for debugging
        const { name, teachers } = req.body; // Extract the school name and teacher data from the form

        // Collect parsed subjects to avoid duplicates
        const processedSubjects = new Set();
        const selectedClasses = new Set();

        // Iterate over the teachers object to process each subject and class
        for (const key in teachers) {
            const match = key.match(/^(.+?)_(.+?)$/); // Match 'Class_Subject' format
            if (match) {
                const className = match[1]; // Extract the class name
                const subjectName = match[2]; // Extract the subject name
                const teacherEmails = teachers[key]; // Get the teacher emails

                // Add the class name to the set of selected classes
                selectedClasses.add(className);

                // Generate a unique identifier for class and subject
                const uniqueKey = `${className}_${subjectName}`;

                // Avoid duplicates by checking the processed subjects set
                if (!processedSubjects.has(uniqueKey)) {
                    processedSubjects.add(uniqueKey);

                    // Create and save a new subject document
                    const subject = new Subject({
                        schoolName: name, // Add the school name
                        classNumber: className,
                        name: subjectName,
                        teacherEmails: Array.isArray(teacherEmails)
                            ? teacherEmails
                            : [teacherEmails],
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

        // Iterate over the students object and save each class
        for (const [classNumber, studentEmails] of Object.entries(students)) {
            // Validate classNumber and studentEmails
            if (!classNumber || typeof classNumber !== 'string') {
                console.error(`Invalid class number: ${classNumber}`);
                continue;
            }

            if (!Array.isArray(studentEmails) || studentEmails.length === 0) {
                console.error(`No valid student emails for class: ${classNumber}`);
                continue;
            }

            // Create and save a class document
            const classDocument = new Class({
                schoolName: schoolName.trim(), // Use the extracted and trimmed school name
                classNumber: classNumber.trim(), // Trim class number for consistency
                studentEmails: studentEmails.filter(email => email.trim() !== ''), // Filter out invalid or empty emails
            });

            await classDocument.save(); // Save the class to the database
            console.log(`Saved class: ${classNumber} with students: ${studentEmails}`);
        }

        // Redirect to the next onboarding step or render the next view
        res.render('school/onboarding/onboarding5', { schoolName, students });
    } catch (error) {
        console.error('Error in onboarding4:', error);
        res.status(500).send('Internal Server Error');
    }
};