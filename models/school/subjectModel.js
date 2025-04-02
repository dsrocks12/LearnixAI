const mongoose = require('mongoose');

const subjectsEnum = Object.freeze({
    English: "English",
    Science: "Science",
    Hindi: "Hindi",
    SocialScience: "Social Science",
    Maths: "Maths",
    ComputerScience: "Computer Science"
});

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
        enum: Object.values(subjectsEnum),
        required: true,
        default: null
    },
    teacherEmails: {
        type: [{
            email: { type: String, required: true },  // ✅ Match DB structure
            teacherName: { type: String, required: true }
        }],
        required: true,
        default: []
    }
});


Object.freeze(subjectsEnum);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
