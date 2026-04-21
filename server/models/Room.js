const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  // שם החדר
  name: {
    type: String,
    required: true
  },
  // מספר קומה
  floor: {
    type: Number,
    required: true
  },
  // אגף
  wing: {
    type: String, // אגף - לדוגמה: "א", "ב", "צפון"
    required: true
  },
  // קיבולת מקסימלית (כללית)
  capacity: {
    type: Number,
    required: true
  },
  // סוג חדר (Enum)
  roomType: {
    type: String,
    required: true,
    enum: [
      'מחשבים', 
      'ספריה', 
      'אולם', 
      'רגיל', 
      'חדר סימולציות', 
      'חדר מזכירות', 
      'חדר פרטי למרכזת/מנהלת'
    ],
    default: 'רגיל'
  },
  // האם יש מקרן?
  hasProjector: {
    type: Boolean, // שימי לב: B גדולה
    required: true,
    default: false
  },
  // לכמה תלמידות החדר מתאים
  numberOfStudents: { // הוספתי נקודתיים ושניתי לאות קטנה בהתחלה (מקובל יותר)
    type: Number,
    required: true
  },
  // האם החדר זמין לשימוש
  isAvailable: {
    type: Boolean, // שימי לב: B גדולה
    required: true,
    default: true
  },// האם יש מערכת שמע
  hasAudioSystem: {
    type: Boolean,
    default: false
  },
  // סוג הישיבה בחדר
  seatingType: {
    type: String,
    enum: ['כסאות סטודנט', 'שולחנות', 'מעבדה', 'ישיבה חופשית'],
    default: 'שולחנות'
  },
  // הערות מנהלתיות
  adminNotes: {
    type: String,
    trim: true
  },

  // רשימת ההקצאות הקבועות של החדר
  permanentAssignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PermanentAssignment'
    }
  ],
  // רשימת הקצאות זמניות של החדר
  temporaryAssignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TemporaryAssignment'
    }
  ],
  // רשימת ביטולים של החדר
  cancellations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cancellation'
    }
  ]
}, { timestamps: true }); // מוסיף אוטומטית תאריך יצירה ועדכון

// ייצוא של המודל
module.exports = mongoose.model('Room', RoomSchema);