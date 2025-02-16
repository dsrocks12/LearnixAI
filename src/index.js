const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const bcrypt = require('bcrypt');


const schoolRoutes = require('./routes/School/schoolRoutes');
const homeRoutes = require('./routes/home/homeRoute');
const teacherRoutes = require('./routes/Teacher/teacherRoutes');
const studentRoutes = require('./routes/Student/studentRoutes');
const teacherDashboardRoutes = require('./routes/teacherDashboardRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');

const app = express();

connectDB()
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => {
    console.error("Database Connection Failed:", err);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', homeRoutes);
app.use('/school', schoolRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/teacher/dashboard', teacherDashboardRoutes);
app.use('/student/dashboard', studentDashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 14000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
