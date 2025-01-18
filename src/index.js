const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const homeRoutes = require('./routes/home/homeRoute');
const schoolRoutes = require('./routes/School/schoolRoutes');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.use('/', homeRoutes);
app.use('/school',schoolRoutes)

// Define Port for Application
const port = 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
