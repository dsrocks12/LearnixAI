const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentEmail: { type: String, required: true },
    studentName: { type: String, required: true },
    classNumber: { type: String, required: true },
    subject: { type: String, required: true },
    submissionFiles: [{ type: String, required: true }], 
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Submitted', 'Late', 'Graded'], default: 'Submitted' },
    feedback: { type: String } 
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
