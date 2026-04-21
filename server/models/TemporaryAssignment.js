const mongoose = require('mongoose');

const TemporaryAssignmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startHour: {
    type: String,
    required: true
  },
  endHour: {
    type: String,
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

module.exports = mongoose.model('TemporaryAssignment', TemporaryAssignmentSchema);