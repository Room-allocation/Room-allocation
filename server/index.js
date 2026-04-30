require('dotenv').config();
const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');

// ייבוא הראוטרים
const roomRoutes = require('./Routes/roomRoutes'); 
const permanentRoutes = require('./Routes/permanentAssignmentRoutes');
const assignmentRoutes = require('./Routes/assignmentRoutes'); // ודאי שהתיקייה היא Routes עם R גדולה

const app = express();

// Middlewares - הגדרות בסיסיות לשרת
app.use(cors()); 
app.use(express.json()); // מאפשר קריאת JSON מה-Body
app.use(express.urlencoded({ extended: true }));

// התחברות למסד הנתונים
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// הגדרת נתיבי ה-API
app.use('/api/rooms', roomRoutes); 
app.use('/api/permanent-assignments', permanentRoutes);
app.use('/api/assignments', assignmentRoutes);

// נתיבי בדיקה
app.get('/', (req, res) => {
    res.send('API is running properly...');
});

app.get('/api/test-now', (req, res) => {
    res.send("השרת מגיב מצוין!");
});

// הגדרת פורט והפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});