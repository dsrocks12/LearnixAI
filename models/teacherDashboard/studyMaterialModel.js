const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema({
  classNumber: { type: String, required: true },
  subjectName: { type: String, required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
