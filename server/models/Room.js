const mongoose = require('mongoose'); // ייבוא ספריית mongoose לניהול הקשר עם בסיס הנתונים

const RoomSchema = new mongoose.Schema({
  // שם החדר (למשל: "חדר 101" או "מעבדת תקשורת")
  name: {
    type: String,
    required: true // שדה חובה
  },

  // מספר הקומה בה נמצא החדר
  floor: {
    type: Number,
    required: true // שדה חובה
  },

  // אגף בבניין - הגבלנו את האפשרויות כדי לשמור על אחידות בנתונים
  wing: {
    type: String,
    required: true,
    enum: ['אגף מרכז', 'אגף ימין', 'אגף שמאל', 'אגף חדש', 'אגף אחר'] // מאפשר לבחור רק מהרשימה הזו
  },

  // קיבולת מקסימלית של אנשים בחדר (לפי תקן בטיחות למשל)
  capacity: {
    type: Number,
    required: true
  },

  // סוג החדר - משפיע על השימוש (למשל: לא נשבץ שיעור רגיל בחדר מחשבים אם לא צריך)
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
    default: 'רגיל' // אם לא יוגדר סוג, המערכת תניח שזה חדר רגיל
  },

  // האם קיים מקרן בחדר? (קריטי למרצות שמעבירות מצגות)
  hasProjector: {
    type: Boolean,
    required: true,
    default: false
  },

  // מספר התלמידות שהחדר ערוך להכיל בפועל (יכול להיות שונה מה-capacity הכללי)
  numberOfStudents: { 
    type: Number,
    required: true
  },

  // האם החדר תקין וזמין לשימוש באופן כללי (לא קשור ללו"ז, אלא לתחזוקה)
  isAvailable: {
    type: Boolean,
    default: true
  },

  // האם קיימת מערכת שמע (רמקולים/הגברה) בחדר?
  hasAudioSystem: {
    type: Boolean,
    default: false
  },

  // האם יש מזגן בחדר?
  hasAC: {
    type: Boolean,
    default: false
  },

  // צורת הישיבה בחדר - משפיע על אופי הפעילות (למשל: סדנה דורשת ישיבה חופשית)
  seatingType: {
    type: String,
    enum: ['כסאות סטודנט', 'שולחנות', 'מעבדה', 'ישיבה חופשית'],
    default: 'שולחנות'
  },

  // הערות חופשיות של מנהל המערכת (למשל: "החלון שבור", "המפתח אצל שרה")
  adminNotes: {
    type: String,
    trim: true // מסיר רווחים מיותרים מהתחלה והסוף של הטקסט
  },

  // מערך של מזהים המקשרים לשיבוצים הקבועים של החדר (מערכת שעות שבועית)
  permanentAssignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PermanentAssignment' // קישור למודל השיבוץ הקבוע
    }
  ],

  // מערך של מזהים המקשרים לשיבוצים זמניים (אירועים חד פעמיים)
  temporaryAssignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TemporaryAssignment' // קישור למודל השיבוץ הזמני
    }
  ],

  // מערך המקשר לביטולים (למשל: אם שיעור קבוע בוטל בתאריך ספציפי)
  cancellations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cancellation' // קישור למודל הביטולים
    }
  ]
}, { timestamps: true }); // מוסיף אוטומטית שדות createdAt (זמן יצירה) ו-updatedAt (זמן עדכון אחרון)
// --- Middleware למחיקה בשרשרת ---

// 1. אנחנו משתמשים ב-async ללא הפרמטר next
RoomSchema.pre('findOneAndDelete', async function() {
    
    // 2. 'this' בקשר הזה מייצג את השאילתה (Query) שעומדת להתבצע.
    // אנחנו שולפים ממנה את ה-ID של החדר שעומד להימחק.
    const roomId = this.getQuery()._id; 

    try {
        // 3. אנחנו ניגשים למודל השיבוצים דרך mongoose.model כדי למנוע בעיות של טעינה מעגלית.
        // הפקודה deleteMany מוחקת את כל המסמכים שעונים על התנאי.
        await mongoose.model('PermanentAssignment').deleteMany({ room: roomId });
        
        console.log(`מערכת: כל השיבוצים של חדר ${roomId} נמחקו אוטומטית.`);
        
        // הערה חשובה: בגלל שהפונקציה היא async, ברגע שהיא מסתיימת, 
        // Mongoose מבין שהכל תקין וממשיך למחיקת החדר עצמו באופן אוטומטי.
    } catch (err) {
        console.error("שגיאה במחיקה בשרשרת:", err);
        // 4. אם יש שגיאה, אנחנו "זורקים" אותה. זה עוצר את מחיקת החדר
        // ושולח את השגיאה לקונטרולר שיציג אותה למשתמש.
        throw err; 
    }
});
// ייצוא המודל כדי שנוכל להשתמש בו ב-Controller
module.exports = mongoose.model('Room', RoomSchema);