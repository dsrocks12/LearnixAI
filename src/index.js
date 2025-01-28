const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import route files
const homeRoutes = require('./routes/home/homeRoute');
const schoolRoutes = require('./routes/School/schoolRoutes');
const teacherRoutes = require('./routes/Teacher/teacherRoutes');
const studentRoutes=require('./routes/Student/studentRoutes')
 // Correct import for teacher routes

// Load environment variables
dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.use('/', homeRoutes);
app.use('/school',schoolRoutes)

// Define Port for Application
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

