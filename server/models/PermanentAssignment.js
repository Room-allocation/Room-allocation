const mongoose = require('mongoose');

const PermanentAssignmentSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,  // 0=ראשון, 1=שני, ... 6=שבת
    required: true
  },
  startHour: {
    type: String,  // לדוגמה: "10:00"
    required: true
  },
  endHour: {
    type: String,  // לדוגמה: "12:00"
    required: true
  },
  lecturerName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  }
});

module.exports = mongoose.model('PermanentAssignment', PermanentAssignmentSchema);