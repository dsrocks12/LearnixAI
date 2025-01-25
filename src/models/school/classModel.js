const mongoose = require('mongoose');

// Schema for the class
const classSchema = new mongoose.Schema({
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
    studentDetails: {
        type: [
            {
                email: {
                    type: String,  // Email ID of the student
                    required: true
                },
                studentName: {
                    type: String,  // Name of the student
                    required: true
                }
            }
        ],
        required: true,
        default: [] // Default to an empty array
    }
});

// Create the Class model
const Class = mongoose.model('Class', classSchema);

module.exports = Class;
