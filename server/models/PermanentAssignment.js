const mongoose = require('mongoose'); // ייבוא ספריית Mongoose לעבודה עם MongoDB

const PermanentAssignmentSchema = new mongoose.Schema({ // הגדרת מבנה הנתונים (סכמה) לשיבוץ קבוע
  
  dayOfWeek: { 
    type: Number,   // סוג נתון מספר (0-6)
    required: true  // שדה חובה - אי אפשר לשבץ בלי לדעת איזה יום בשבוע
  },

  startHour: { 
    type: String,   // שומרים כשעה (למשל "08:00") כטקסט לצורך נוחות תצוגה
    required: true  // חובה להגדיר מתי השיעור מתחיל
  },

  endHour: { 
    type: String,   // שעת סיום (למשל "10:30")
    required: true  // חובה להגדיר מתי החדר מתפנה
  },

  lecturerName: { 
    type: String,   // שם המרצה שמעבירה את השיעור
    required: true  // שדה חובה כדי שנדע למי לפנות במידת הצורך
  },

  subject: { 
    type: String,   // שם המקצוע או התוכן הנלמד
    required: true  // חובה כדי להציג במערכת מה קורה בחדר
  },

  room: { 
    type: mongoose.Schema.Types.ObjectId, // מפתח זר - מצביע על ה-ID של החדר בטבלה אחרת
    ref: 'Room',                          // מקשר לסכמה שנקראת 'Room' (מאפשר לבצע Populate)
    required: true                        // אי אפשר ליצור שיבוץ בלי לשייך אותו לחדר ספציפי
  },

  bookedBy: { // אובייקט פנימי המכיל פרטים על מזמין החדר
    
    operatorName: { 
        type: String, 
        required: true // שם המזכירה/אחראית שביצעה את הרישום בפועל
    },

    phone: { 
        type: String, 
        required: true // מספר טלפון ליצירת קשר במקרה של שינויים דחופים
    },

    classOrGroup: { 
        type: String   // לאיזו כיתה או קבוצה משוריין החדר (למשל: "ו' 2")
    },

    eventType: { 
      type: String,   // סיווג סוג הפעילות
      required: true, 
      enum: ['שיעור', 'קורס', 'מסלול', 'פעילות לא שגרתית'] // מגביל את הערכים האפשריים רק לרשימה זו
    }
  }

}, { timestamps: true }); // מוסיף שדות createdAt ו-updatedAt באופן אוטומטי לכל מסמך

module.exports = mongoose.model('PermanentAssignment', PermanentAssignmentSchema); // ייצוא המודל לשימוש בשאר חלקי השרת