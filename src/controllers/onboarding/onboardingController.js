const Subject = require('../../models/school/onboarding')


exports.onboarding1 = async (req, res) => {
    const selectedClasses = req.body['selectedClasses[]']; // Check if this is being populated correctly
    console.log(selectedClasses); // Debug: Check if this is outputting the correct value
    
    res.render('school/onboarding/onboarding2', { selectedClasses: selectedClasses });
}


exports.onboarding2 = async (req, res) => {
    try {
        const rawData = req.body; // Incoming data from the form
        const transformedData = {};

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

        console.log("Transformed Data:", transformedData); // Debug: Verify the final structure

        // Render the next view with the transformed data
        res.render('school/onboarding/onboarding3', { data: transformedData });
    } catch (error) {
        console.error("Error in onboarding2 controller:", error);
        res.status(500).send("An error occurred while processing the data.");
    }
};


exports.onboarding3 = async (req, res) => {
    try {
        const data = req.body;
        console.log(data);

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

                        const subject = new Subject.Subject({
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


exports.onboarding4 = async(req,res) =>{
    try{
        const data = req.body;
        console.log(data);
        res.render('school/onboarding/onboarding5');
    }catch(error){
        console.log(error);
    }

}


