const Assignment = require('../../models/teacherDashboard/assignmentModel');
const Subject = require('../../models/school/subjectModel'); // used for teacher name lookup
const path = require('path');

// Render the new assignment form
exports.getNewAssignmentForm = async (req, res) => {
  try {
    let { email, classNumber, subject } = req.query; // teacherEmail, class, subject from URL
    console.log(classNumber, subject);
    
    // Ensure classNumber is in the correct format (e.g., "Class 1")
    classNumber = `Class ${classNumber}`;
    
    // Find the subject document to get the teacher's name
    const subjectDoc = await Subject.findOne({ classNumber, name: subject });
    let teacherName = '';
    if (subjectDoc) {
      // Look for the teacher object matching the provided email
      const teacherObj = subjectDoc.teacherEmails.find(t => t.email === email);
      if (teacherObj) teacherName = teacherObj.teacherName;
    }
    
    console.log(teacherName);
    res.render('teacherDashboard/assignmentForm', {
      teacherEmail: email,
      teacherName,
      classNumber,
      subject
    });
  } catch (error) {
    console.error('Error rendering new assignment form:', error);
    res.status(500).send("Server Error");
  }
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    let { teacherEmail, teacherName, classNumber, subject, title, description, dueDate } = req.body;
    classNumber = `Class ${classNumber}`;
    
    let files = [];
    if (req.file) {
      // Save file path relative to the uploads folder
      files.push('/uploads/' + req.file.filename);
    }
    const newAssignment = new Assignment({
      teacherEmail,
      teacherName,
      classNumber,
      subject,
      title,
      description,
      dueDate,
      files
    });
    await newAssignment.save();
    res.redirect(`/teacher/dashboard/class/${encodeURIComponent(classNumber)}/${encodeURIComponent(subject)}`);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).send("Server Error");
  }
};

// Render the edit assignment form
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

// Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    let updateData = {
      title,
      description,
      dueDate
    };
    if (req.file) {
      // Optionally update the file; here we replace the existing file array with the new file
      updateData.files = ['/uploads/' + req.file.filename];
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