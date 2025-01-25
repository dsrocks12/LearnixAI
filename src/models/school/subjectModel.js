const mongoose = require('mongoose');

// Enum for subjects
const subjectsEnum = Object.freeze({
    English: "English",
    Science: "Science",
    Hindi: "Hindi",
    SocialScience: "Social Science",
    Maths: "Maths",
    ComputerScience: "Computer Science"
});

// Schema for the subject
const subjectSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
        default: null
    },
    classNumber: {
        type: String,
        required: true,
        default: null
    },
    name: {
        type: String,
        enum: Object.values(subjectsEnum), // Restrict to predefined subject names
        required: true,
        default: null
    },
    teacherEmails: {
        type: [
            {
                email: {
                    type: String, // Email address
                    required: true
                },
                teacherName: {
                    type: String, // Name of the teacher
                    required: true
                }
            }
        ],
        required: true,
        default: []
    }
});

// Freeze the subjectsEnum to prevent modifications
Object.freeze(subjectsEnum);

// Create the Subject model
const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
