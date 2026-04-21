const mongoose = require('mongoose');

const CancellationSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  permanentAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PermanentAssignment',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  reason: {
    type: String  // לא חובה, אבל שימושי
  }
});

module.exports = mongoose.model('Cancellation', CancellationSchema);