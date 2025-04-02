const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    classNumber: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    files: [{ type: String }] 
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
