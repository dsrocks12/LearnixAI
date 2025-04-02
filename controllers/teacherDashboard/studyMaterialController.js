const StudyMaterial = require("../../models/teacherDashboard/studyMaterialModel");
const path = require("path");

// Upload Study Material
const uploadStudyMaterial = async (req, res) => {
  try {
    console.log("📂 Uploading Study Material:", req.body);
    
    const { classNumber, subjectName, title } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "❌ File is required" });
    }
    // Build fileUrl from the uploaded file (assuming uploads folder is served statically)
    const fileUrl = `/uploads/${req.file.filename}`;

    if (!classNumber || !subjectName || !title || !fileUrl) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    const newMaterial = new StudyMaterial({ classNumber, subjectName, title, fileUrl });
    await newMaterial.save();

    console.log("✅ Study Material uploaded successfully:", newMaterial);
    res.redirect(`/teacher/dashboard/class/${classNumber}/${subjectName}`);
  } catch (error) {
    console.error("❌ Error uploading study material:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

// Get Study Materials
const getStudyMaterials = async (req, res) => {
  try {
    const { classNumber, subjectName } = req.params;

    if (!classNumber || !subjectName) {
      return res.status(400).json({ message: "❌ Missing required parameters" });
    }

    const materials = await StudyMaterial.find({ classNumber, subjectName });
    res.status(200).json({ materials });
  } catch (error) {
    console.error("❌ Error fetching study materials:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

// Delete Study Material
const deleteStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaterial = await StudyMaterial.findByIdAndDelete(id);

    if (!deletedMaterial) {
      return res.status(404).json({ message: "❌ Study material not found" });
    }

    console.log("✅ Study Material deleted:", deletedMaterial._id);
    res.json({ message: "✅ Study Material deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting study material:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

// Update Study Material
const updateStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, classNumber, subjectName } = req.body;
    
    // Prepare update object
    let updateData = { title };
    
    // If a new file is uploaded, update fileUrl
    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedMaterial) {
      return res.status(404).json({ message: "❌ Study material not found" });
    }

    console.log("✅ Study Material updated:", updatedMaterial._id);
    res.redirect(`/teacher/dashboard/class/${classNumber}/${subjectName}`);
  } catch (error) {
    console.error("❌ Error updating study material:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

module.exports = {
  uploadStudyMaterial,
  getStudyMaterials,
  deleteStudyMaterial,
  updateStudyMaterial
};
