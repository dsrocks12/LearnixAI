const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
        default: null,
    },
    region: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

teacherSchema.index({ schoolName: 1, region: 1, email: 1 }, { unique: true });

// Prevent OverwriteModelError
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
