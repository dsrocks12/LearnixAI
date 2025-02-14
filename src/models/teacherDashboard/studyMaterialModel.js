const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    teacherEmail: { type: String, required: true },
    teacherName: { type: String, required: true },
    schoolName: { type: String, required: true },
    region: { type: String, required: true },
    classNumber: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrls: [{ type: String, required: true }], 
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
module.exports = StudyMaterial;
