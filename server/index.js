require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const assignmentRoutes = require('./routes/assignmentRoutes');
// ייבוא הראוטר שיצרנו (שימי לב לנתיב המדויק)
const roomRoutes = require('./Routes/roomRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// חיבור למסד הנתונים
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));
// הגדרת הקידומת לכל נתיבי החדרים
app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
    res.send('API is running properly...');
});
app.get('/api/rooms', async (req, res) => {
  const rooms = await mongoose.connection.db.collection('rooms').find().toArray();
  res.json(rooms);
});
app.use('/api/assignments', assignmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});