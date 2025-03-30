const Assignment = require('../../models/teacherDashboard/assignmentModel');
const Subject = require('../../models/school/subjectModel'); // Used for teacher name lookup
const path = require('path');
const { validationResult } = require('express-validator');

// ✅ Fetch assignments for a specific class and subject
exports.getAssignments = async (req, res) => {
  try {
    const { classNumber, subject } = req.query;

    if (!classNumber || !subject) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    console.log("Fetching assignments for Class:", classNumber, "Subject:", subject);

    const assignments = await Assignment.find({ classNumber, subject }).sort({ createdAt: -1 });

    if (assignments.length === 0) {
      console.log("No assignments found.");
      return res.json({ success: true, assignments: [], message: "No assignments posted." });
    }

    console.log("Assignments retrieved:", assignments.length);
    res.json({ success: true, assignments });

  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Render the new assignment form
exports.getNewAssignmentForm = async (req, res) => {
  try {
    let { classNumber, subject } = req.query;

    if (!classNumber || !subject) {
      return res.status(400).send("Missing required query parameters.");
    }

    classNumber = decodeURIComponent(classNumber).trim();
    subject = decodeURIComponent(subject).trim();

    console.log("Rendering form for Class:", classNumber, "Subject:", subject);

    res.render('teacherDashboard/assignmentForm', { classNumber, subject });

  } catch (error) {
    console.error('Error rendering new assignment form:', error);
    res.status(500).send("Server Error");
  }
};

// ✅ Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    console.log("Received request to create assignment:", req.body);
    console.log("Uploaded file:", req.file);

    let { classNumber, subject, title, description, dueDate } = req.body;
    
    if (!classNumber || !subject || !title || !dueDate) {
      return res.status(400).send("Missing required fields.");
    }

    classNumber = classNumber.trim();
    subject = subject.trim();

    let files = [];
    if (req.file) {
      files.push('/uploads/' + req.file.filename);
    }

    const newAssignment = new Assignment({
      classNumber,
      subject,
      title,
      description,
      dueDate,
      files
    });

    await newAssignment.save();
    console.log("Assignment created successfully");

    res.json({ success: true, message: "Assignment created successfully!" });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).send("Server Error");
  }
};

// ✅ Render the edit assignment form
exports.getEditAssignmentForm = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }
    res.render('teacherDashboard/editAssignmentForm', { assignment });
  } catch (error) {
    console.error('Error rendering edit assignment form:', error);
    res.status(500).send("Server Error");
  }
};

// ✅ Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).send("Title and due date are required.");
    }

    let updateData = { title, description, dueDate };

    if (req.file) {
      const existingAssignment = await Assignment.findById(req.params.id);
      if (existingAssignment) {
        updateData.files = [...existingAssignment.files, '/uploads/' + req.file.filename];
      } else {
        updateData.files = ['/uploads/' + req.file.filename];
      }
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedAssignment) {
      return res.status(404).send("Assignment not found");
    }

    res.redirect(`/teacher/dashboard/class/${encodeURIComponent(updatedAssignment.classNumber)}/${encodeURIComponent(updatedAssignment.subject)}`);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).send("Server Error");
  }
};


// ✅ Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the assignment
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).send("Assignment not found.");
    }

    // Store classNumber and subject before deleting
    const { classNumber, subject } = assignment;

    // Delete the assignment
    await Assignment.findByIdAndDelete(id);
    console.log(`🗑️ Assignment "${assignment.title}" deleted successfully.`);

    // Redirect back to the class dashboard
    res.redirect(`/teacher/dashboard/class/${encodeURIComponent(classNumber)}/${encodeURIComponent(subject)}`);
  } catch (error) {
    console.error("❌ Error deleting assignment:", error);
    res.status(500).send("Server Error");
  }
};
