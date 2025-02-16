const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    teacherEmail: { type: String, required: true },
    teacherName: { type: String, required: true },
    schoolName: { type: String, required: true },
    region: { type: String, required: true },
    classNumber: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    attachments: [{ type: String }], 
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;
