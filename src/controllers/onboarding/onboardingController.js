const Subject = require('../../models/school/onboarding');
const Class = require('../../models/school/onboarding'); // Import the Class model


exports.onboarding1 = async (req, res) => {
    // console.log(req.body);

    // Destructure using correct keys from req.body
    const { name, selectedClasses } = req.body;

    console.log('Selected Classes:', selectedClasses); // Debug: Log selected classes
    console.log('Name:', name); // Debug: Log name

    // Render 'onboarding2' and send both 'selectedClasses' and 'name' to the next page
    res.render('school/onboarding/onboarding2', { selectedClasses, name });
};




exports.onboarding2 = async (req, res) => {
    try {
        const rawData = req.body; // Incoming data from the form
        const transformedData = {};
        const { name } = req.body; // Extract 'name' from the incoming data

        // Transform raw data into the required structure
        for (const key in rawData) {
            const match = key.match(/^subjects\[(.+?)\]\[\]$/); // Match "subjects[Class Name][]"
            if (match) {
                const className = match[1]; // Extract class name from the key
                // Ensure transformedData[className] is initialized as an array
                if (!transformedData[className]) {
                    transformedData[className] = [];
                }
                // Add subjects to the corresponding class
                transformedData[className] = transformedData[className].concat(rawData[key]);
            }
        }

        // console.log("Transformed Data:", transformedData); // Debug: Verify the final structure

        // Render the next view with the transformed data and name
        res.render('school/onboarding/onboarding3', { data: transformedData, name: name });
    } catch (error) {
        console.error("Error in onboarding2 controller:", error);
        res.status(500).send("An error occurred while processing the data.");
    }
};


exports.onboarding3 = async (req, res) => {
    try {
        const data = req.body;
        const schoolName = req.body.name; // Assuming the name is passed as 'name' in the form
        // console.log('School Name:', schoolName);
        // console.log('Form Data:', data);

        // Collect parsed subjects to avoid duplicates
        const processedSubjects = new Set();

        // Collect the list of classes
        const selectedClasses = new Set();

        // Iterate over the keys in the request body to extract relevant data
        for (const key in data) {
            if (key.startsWith('teachers[')) {
                const match = key.match(/^teachers\[(.+?)_(.+?)\]\[\]$/);
                if (match) {
                    const className = match[1]; // Extract the class name
                    const subjectName = match[2]; // Extract the subject name
                    const teacherEmail = data[key]; // Get the email(s)

                    // Add the class name to the selected classes
                    selectedClasses.add(className);

                    // Generate a unique identifier for class and subject
                    const uniqueKey = `${className}_${subjectName}`;

                    if (!processedSubjects.has(uniqueKey)) {
                        processedSubjects.add(uniqueKey);

                        // Create and save a new subject document with the schoolName
                        const subject = new Subject.Subject({
                            schoolName: schoolName,  // Add the school name
                            classNumber: className,
                            name: subjectName,
                            teacherEmails: Array.isArray(teacherEmail)
                                ? teacherEmail
                                : [teacherEmail],
                        });

                        await subject.save(); // Save the subject to the database
                    }
                }
            }
        }

        // Convert the set of selected classes to an array
        const selectedClassesArray = Array.from(selectedClasses);

        // Pass the list of classes to the view
        res.render('school/onboarding/onboarding4', { selectedClasses: selectedClassesArray });
    } catch (error) {
        console.error('Error saving subjects:', error);
        res.status(500).send('An error occurred while saving subjects.');
    }
};






exports.onboarding4 = async (req, res) => {
    try {
        const data = req.body; // Get the data from the request body
        console.log('Received Data:', data);

        // Extract and validate the school name
        const schoolName = data.Name;
        if (!schoolName || typeof schoolName !== 'string' || schoolName.trim() === '') {
            console.error('School Name is required and must be a valid string');
            return res.status(400).send('School Name is required');
        }

        // Parse Selected Classes into an array if needed
        let selectedClasses = data['Selected Classes'];
        if (typeof selectedClasses === 'string') {
            try {
                selectedClasses = JSON.parse(selectedClasses); // Convert string to array if passed as a string
            } catch (parseError) {
                console.error('Error parsing Selected Classes:', parseError);
                return res.status(400).send('Invalid Selected Classes format');
            }
        }

        // Ensure selectedClasses is an array
        if (!Array.isArray(selectedClasses) || selectedClasses.length === 0) {
            console.error('Selected Classes is not a valid array');
            return res.status(400).send('Selected Classes must be a non-empty array');
        }

        // Iterate over the selected classes and save each class
        for (const className of selectedClasses) {
            const studentEmailsKey = `students[${className}][]`;
            const studentEmails = data[studentEmailsKey];

            if (!studentEmails) {
                console.log(`No student emails found for class: ${className}`);
                continue; // Skip if no emails are provided for the class
            }

            // Normalize studentEmails to an array
            const emails = Array.isArray(studentEmails)
                ? studentEmails
                : [studentEmails];

            // Create and save a class document
            const classDocument = new Class({
                schoolName, // Use the extracted school name
                classNumber: className,
                studentEmails: emails,
            });

            await classDocument.save();
            console.log(`Saved class: ${className} with students: ${emails}`);
        }

        // Redirect to the next onboarding step or send a response
        res.render('school/onboarding/onboarding5');
    } catch (error) {
        console.error('Error in onboarding4:', error);
        res.status(500).send('Internal Server Error');
    }
};
