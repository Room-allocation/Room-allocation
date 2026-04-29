// const express = require('express');
// const app = express();
// const PORT = 5000;

// app.get('/', (req, res) => {
//     res.send('Seminar Room Booking API is running...');
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const assignmentRoutes = require('./routes/assignmentRoutes');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api/rooms', async (req, res) => {
  const rooms = await mongoose.connection.db.collection('rooms').find().toArray();
  res.json(rooms);
});
app.use('/api/assignments', assignmentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});