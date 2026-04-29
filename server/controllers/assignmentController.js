const Room = require('../models/Room');
const Cancellation = require('../models/Cancellation');
const PermanentAssignment = require('../models/PermanentAssignment');
const TemporaryAssignment = require('../models/TemporaryAssignment');

// מחיקת כל השיבוצים הן הקבועים והן הזמניים


// משימה C9: שימוש ב-Named Export
exports.clearAllAssignments = async (req, res) => {
  try {
    await PermanentAssignment.deleteMany({});
    await TemporaryAssignment.deleteMany({});
    res.status(200).json({ message: "כל השיבוצים נמחקו בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "שגיאה במחיקה", error: error.message });
  }
};


//הוספת שיבוץ קבוע עם לוגיקת מניעת התנגשויות

exports.addPermanentAssignment = async (req, res) => {
  try {
    const { dayOfWeek, startHour, endHour, room, lecturerName, subject } = req.body;

    // שאילתת בסיס לבדיקת חפיפת שעות באותו חדר
    const timeOverlapQuery = {
      room: room,
      $or: [
        { startHour: { $lt: endHour }, endHour: { $gt: startHour } }
      ]
    };

    // 1. בדיקה מול שיבוצים קבועים (באותו יום בשבוע ובאותו חדר)
    const permanentConflict = await PermanentAssignment.findOne({
      ...timeOverlapQuery,
      dayOfWeek: dayOfWeek
    });

    if (permanentConflict) {
      return res.status(400).json({
        message: `התנגשות: החדר תפוס קבוע ע"י ${permanentConflict.lecturerName} (${permanentConflict.subject})`
      });
    }

    // 2. בדיקה מול שיבוצים זמניים
    // אנחנו שולפים את כל השיבוצים הזמניים בחדר הזה ובשעות האלו
    const potentialTempConflicts = await TemporaryAssignment.find(timeOverlapQuery);

    // מסננים ובודקים אם אחד מהם נופל על אותו יום בשבוע
    const actualTempConflict = potentialTempConflicts.find(temp => {
      const tempDate = new Date(temp.date);
      return tempDate.getDay() === Number(dayOfWeek);
    });

    if (actualTempConflict) {
      return res.status(400).json({
        message: `התנגשות: קיים שיבוץ זמני בתאריך ${actualTempConflict.date.toLocaleDateString()} ביום זה`
      });
    }

    // 3. אם אין התנגשויות - שומרים את השיבוץ החדש
    const newAssignment = new PermanentAssignment(req.body);
    await newAssignment.save();

    res.status(201).json({
      message: "השיבוץ הקבוע נוסף בהצלחה!",
      data: newAssignment
    });

  } catch (error) {
    res.status(500).json({ message: "שגיאה בשרת בהוספת השיבוץ", error: error.message });
  }
};

// מחיקת שיבוץ קבוע לפי ID
exports.deletePermanentAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PermanentAssignment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "השיבוץ לא נמצא" });
    }

    res.status(200).json({ message: "השיבוץ הקבוע נמחק בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "שגיאה במחיקת השיבוץ", error: error.message });
  }
}
//משימה: חדר- פונקציה להוספת/מחיקת ביטול חד פעמי.

// פונקציה להוספת ביטול חד פעמי
exports.addCancellation = async (req, res) => {
  try {
    const { date, permanentAssignmentId, reason } = req.body;

    // בדיקה שהשיבוץ הקבוע קיים
    const assignment = await PermanentAssignment.findById(permanentAssignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Permanent assignment not found' });
    }

    // בדיקה אם כבר קיים ביטול לאותו תאריך
    const existingCancellation = await Cancellation.findOne({
      permanentAssignment: permanentAssignmentId,
      date: new Date(date)
    });

    if (existingCancellation) {
      return res.status(400).json({ message: 'Cancellation already exists for this date' });
    }

    // יצירת הביטול
    const cancellation = new Cancellation({
      date,
      permanentAssignment: permanentAssignmentId,
      room: assignment.room,
      reason
    });

    await cancellation.save();

    // הוספה לחדר
    await Room.findByIdAndUpdate(
      assignment.room,
      { $push: { cancellations: cancellation._id } }
    );

    res.status(201).json(cancellation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// פונקציה למחיקת ביטול חד פעמי
exports.deleteCancellation = async (req, res) => {
  try {
    const { id } = req.params;

    const cancellation = await Cancellation.findById(id);
    if (!cancellation) {
      return res.status(404).json({ message: 'Cancellation not found' });
    }

    // הסרה מהחדר
    await Room.findByIdAndUpdate(
      cancellation.room,
      { $pull: { cancellations: cancellation._id } }
    );

    // מחיקה מה-DB
    await Cancellation.findByIdAndDelete(id);

    res.json({ message: 'Cancellation deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



// ────────────── פונקציה להוספת שיבוץ זמני- כולל 3 חלקים ──────────────

// ───────────────────────── פונקציות עזר ─────────────────────────
// בדיקת חפיפת שעות בין שני שיבוצים
function hasTimeOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

// שמירת שיבוץ זמני במונגו ועדכון החדר
async function saveTemporaryAssignment({ date, startHour, endHour, room, subject, bookedBy }, message) {
  const newTemp = new TemporaryAssignment({ date, startHour, endHour, room, subject, bookedBy });
  await newTemp.save();

  // הוספת ה-ID של השיבוץ החדש למערך של החדר
  await Room.findByIdAndUpdate(room, {
    $push: { temporaryAssignments: newTemp._id }
  });

  return { message, data: newTemp };
}

exports.addTemporaryAssignment = async (req, res) => {

  try {
    // קודם כל - קבלת הנתונים מהבקשה
    const { date, startHour, endHour, room, subject, bookedBy } = req.body;

    // רק אחר כך - בדיקת שדות חובה
    if (!date || !startHour || !endHour || !room || !subject || !bookedBy) {
      return res.status(400).json({ message: 'חסרים שדות חובה' });
    }

    // בדיקה שהחדר קיים
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ message: 'החדר לא נמצא' });
    }

    // הכנת התאריך לחיפוש
    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);


    //────────────── שלב 1 - בדיקת שיבוצים זמניים קיימים באותו חדר ותאריך  ──────────────
    const existingTemporary = await TemporaryAssignment.find({
      room,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    //בדיקת חפיפת שעות של שיעורים זמניים במערך שחזר
    const tempConflict = existingTemporary.find(t =>
      hasTimeOverlap(startHour, endHour, t.startHour, t.endHour)
    );

    if (tempConflict) {
      return res.status(400).json({
        message: `התנגשות: קיים כבר שיבוץ זמני בחדר זה בין ${tempConflict.startHour} - ${tempConflict.endHour}`
      });
    }


    //────────────── שלב 2 - בדיקת שיבוצים קבועים באותו יום בשבוע  ──────────────
    const dayOfWeek = requestedDate.getDay();
    const permanentOnThisDay = await PermanentAssignment.find({ room, dayOfWeek });

    const permanentConflict = permanentOnThisDay.find(p =>
      hasTimeOverlap(startHour, endHour, p.startHour, p.endHour)
    );

    // אין שיבוץ קבוע מתנגש - החדר פנוי מוסיפים את השיבוץ הזמני
    if (!permanentConflict) {
      const result = await saveTemporaryAssignment(req.body, 'השיבוץ הזמני נוסף בהצלחה!');
      return res.status(201).json(result);
    }


    //────────────── שלב 3 - יש שיבוץ קבוע מתנגש, בודקים אם קיים ביטול לתאריך זה  ──────────────
    const cancellation = await Cancellation.findOne({
      permanentAssignment: permanentConflict._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!cancellation) {
      return res.status(400).json({
        message: `התנגשות: החדר תפוס קבוע ע"י "${permanentConflict.subject}" ואין ביטול לתאריך זה`
      });
    }

    // יש ביטול - החדר פנוי!
    const result = await saveTemporaryAssignment(req.body, 'השיבוץ הזמני נוסף בהצלחה! (החדר היה פנוי בגלל ביטול שיבוץ קבוע)');
    return res.status(201).json(result);

  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשרת', error: error.message });
  }
};



// ────────────── פונקציה למחיקת שיבוץ זמני ──────────────
exports.deleteTemporaryAssignment = async (req, res) => {
  try {
    // URLמתוך ה idשליפת ה
    const { id } = req.params;

    //id חיפוש השיבוץ הזמני לפי
    // אם לא נמצא - החזרת שגיאה 404
    const temp = await TemporaryAssignment.findById(id);
    if (!temp) {
      return res.status(404).json({ message: 'השיבוץ הזמני לא נמצא' });
    }
    
    //אם נמצא
    //של השיבוץ מהמערך של החדר id הסרת ה
    await Room.findByIdAndUpdate(temp.room, {
      $pull: { temporaryAssignments: temp._id }
    });

    // מחיקת השיבוץ הזמני ממונגו
    await TemporaryAssignment.findByIdAndDelete(id);

    res.status(200).json({ message: 'השיבוץ הזמני נמחק בהצלחה' });

  }
  catch (error) {
    res.status(500).json({ message: 'שגיאה בשרת', error: error.message });
  }
}