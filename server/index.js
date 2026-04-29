require('dotenv').config();
const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
// ייבוא הראוטרים שמכילים את הגדרות ה-API עבור כל ישות
const roomRoutes = require('./Routes/roomRoutes'); // ראוטר לניהול חדרים
 // ראוטר לניהול שיבוצים קבועים
const permanentRoutes = require('./Routes/permanentAssignmentRoutes');
const app = express(); // יצירת מופע של אפליקציית השרת

// Middlewares - פונקציות ביניים שרצות על כל בקשה שמגיעה לשרת
app.use(cors()); // הפעלת הגדרות CORS כדי למנוע חסימות גישה מהדפדפן
app.use(express.json()); // מאפשר לשרת לקרוא ולהבין מידע שנשלח בפורמט JSON בתוך גוף הבקשה (body)

// התחברות למסד הנתונים באמצעות הכתובת שנמצאת במשתני הסביבה
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!')) // הדפסה במקרה של הצלחה
  .catch((err) => console.error('MongoDB connection error:', err)); // הדפסת שגיאה במקרה של כישלון התחברות

// הגדרת נתיבי ה-API והצמדתם לראוטרים המתאימים
app.use('/api/rooms', roomRoutes); // כל בקשה שתתחיל בנתיב זה תופנה לניהול החדרים
app.use('/api/permanent-assignments', permanentRoutes); // כל בקשה שתתחיל בנתיב זה תופנה לניהול השיבוצים

// נתיב בדיקה בסיסי כדי לוודא שהשרת באוויר
app.get('/', (req, res) => {
    res.send('API is running properly...'); // מחזיר הודעת טקסט פשוטה לדפדפן
});

// הגדרת הפורט עליו ירוץ השרת (מתוך משתני הסביבה או ברירת מחדל 5000)
const PORT = process.env.PORT || 5000;



//רק לניסוי
app.get('/api/test-now', (req, res) => res.send("השרת מגיב מצוין!"));

// הפעלת השרת והתחלת האזנה לבקשות נכנסות
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // הדפסת הודעה שהשרת מוכן לעבודה
});