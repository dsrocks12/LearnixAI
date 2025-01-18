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
    
    classNumber: {
        type: String,
        required: true,
        default: null
    },
    name: {
        type: String,
        enum: Object.values(subjectsEnum),  // Restrict to predefined subject names
        required: true,
        default: null
    },
    teacherEmails: {
        type: [String],  // Array of email addresses
        required: true,
        default: null
    }
});

// Schema for the class
const classSchema = new mongoose.Schema({
    classNumber:{
        type: String,
        required: true,
        default: null,
    },
    studentEmails: {
        type: [String],  // List of student email addresses
        required: true,
        default: null
    },
  
});

// Schema for the school
const schoolSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        default: null
    },
    classes: {
        type: [classSchema],  // Array of class objects
        required: true
    },

});

// Models
const Subject = mongoose.model('Subject', subjectSchema);
const Class = mongoose.model('Class', classSchema);
const School = mongoose.model('School', schoolSchema);

module.exports = { Subject, Class, School };
