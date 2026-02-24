const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_calculator')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
    res.send('Attendance Calculator API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
