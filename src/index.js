const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const schoolRoutes = require('./routes/School/schoolRoutes');
const homeRoutes = require('./routes/home/homeRoute');
const teacherRoutes = require('./routes/Teacher/teacherRoutes');
const studentRoutes = require('./routes/Student/studentRoutes');
const teacherDashboardRoutes = require('./routes/teacherDashboardRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');
const announcementRoutes = require('./routes/TeacherDashboard/announcementRoutes');
const assignmentRoutes = require('./routes/TeacherDashboard/assignmentRoutes');
const materialRoutes = require('./routes/TeacherDashboard/studyMaterialRoutes');
// const submissionRoutes = require('./routes/teacher/submissionRoutes');

const app = express();

connectDB()
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch(err => {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Register Routes
app.use('/', homeRoutes);
app.use('/teacher/dashboard', teacherDashboardRoutes);
app.use('/student/dashboard', studentDashboardRoutes);

app.use('/school', schoolRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// ✅ New Routes Added
app.use('/teacher/announcement', announcementRoutes);
app.use('/teacher/assignment', assignmentRoutes);
app.use('/teacher/studyMaterial', materialRoutes);
// app.use('/teacher/submission', submissionRoutes);

// ❌ Handle 404 Routes
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route Not Found" });
});

// ❌ Handle Server Errors
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "❌ Internal Server Error", error: err.message });
});

// ✅ Debugging: List all registered routes
const listRoutes = (app) => {
  console.log("\n🔍 Listing all registered routes:");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`✅ ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((subMiddleware) => {
        if (subMiddleware.route) {
          console.log(`✅ ${subMiddleware.route.stack[0].method.toUpperCase()} ${middleware.regexp} -> ${subMiddleware.route.path}`);
        }
      });
    }
  });
};
listRoutes(app);

const PORT = process.env.PORT || 15000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
