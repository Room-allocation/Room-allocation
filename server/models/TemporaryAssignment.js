const mongoose = require('mongoose'); // מייבוא של ספריית mongoose לתקשורת עם ה-DB

const TemporaryAssignmentSchema = new mongoose.Schema({
  
  date: {
    type: Date,     // סוג נתון של תאריך (כולל שנה, חודש ויום)
    required: true  // חובה להזין תאריך כדי לדעת מתי השיבוץ מתקיים
  },

  startHour: {
    type: String,   // שעת התחלה בפורמט טקסט (לדוגמה: "14:30")
    required: true  // שדה חובה
  },

  endHour: {
    type: String,   // שעת סיום בפורמט טקסט (לדוגמה: "16:00")
    required: true  // שדה חובה
  },

  subject: {
    type: String,   // נושא השיעור או האירוע
    required: true  // שדה חובה
  },

  room: {
    type: mongoose.Schema.Types.ObjectId, // מזהה ייחודי שמקשר לחדר
    ref: 'Room',                          // מצביע על מודל ה-Room שיצרנו קודם
    required: true                        // חובה לשייך לחדר מסוים
  },

  bookedBy: { // אובייקט מקונן המכיל את פרטי האחראי על ההזמנה
    
    operatorName: { 
      type: String, 
      required: true // שם המזמין/ה (למשל המזכירה שביצעה את הפעולה)
    },

    phone: { 
      type: String, 
      required: true // טלפון ליצירת קשר לבירורים
    },

    classOrGroup: { 
      type: String   // שם הכיתה או הקבוצה (למשל: "סמינר א'", "מורות")
    },

    eventType: {
      type: String,
      required: true,
      enum: ['שיעור', 'קורס', 'מסלול', 'פעילות לא שגרתית'] // רשימת ערכים מוגדרת מראש למניעת שגיאות
    }
  }
}, { timestamps: true }); // מוסיף אוטומטית שדות של מתי נוצר השיבוץ ומתי הוא עודכן לאחרונה

// ייצוא המודל לשימוש ב-Controller
module.exports = mongoose.model('TemporaryAssignment', TemporaryAssignmentSchema);