const Room = require('../models/Room');
const PermanentAssignment = require('../models/PermanentAssignment')

// 1. קבלת כל החדרים
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//  קבלת חדר לפי ID
exports.getRoomById = async (req, res) => {
     try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "החדר לא נמצא" });
        }

        // החזרת המשתנה הנכון
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//  יצירת חדר חדש
exports.createRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// עדכון חדר קיים
exports.updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. מחיקת חדר (הגרסה המשודרגת!)
exports.deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;

        // שלב א': מחפשים את השיבוצים כדי שיהיה לנו מידע להחזיר למשתמש
        const assignmentsToDelete = await PermanentAssignment.find({ room: roomId });
        
        // שלב ב': מוחקים את החדר (ה-Middleware במודל כבר ימחק את השיבוצים ב-DB)
        const deletedRoom = await Room.findByIdAndDelete(roomId);

        if (!deletedRoom) {
            return res.status(404).json({ message: "החדר לא נמצא" });
        }

        // שלב ג': מחזירים תשובה חכמה למסך
        res.status(200).json({ 
            message: `החדר "${deletedRoom.name}" נמחק בהצלחה.`,
            deletedAssignmentsCount: assignmentsToDelete.length,
            details: assignmentsToDelete.map(a => ({
                subject: a.subject,
                lecturer: a.lecturerName
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};







// פונקציית החיפוש
exports.searchAvailableRooms = async (req, res) => {
    try {
        // שליפת הפרמטרים שנשלחו מה-Client (דרך ה-URL)
        const { date, startHour, endHour, wing, capacity, roomType, hasProjector } =
            req.query;

        // בניית אובייקט שאילתה בסיסי לפי מאפיינים פיזיים של החדר
        let query = { isAvailable: true };
        if (wing) query.wing = wing;
        if (capacity) query.capacity = { $gte: Number(capacity) };
        if (roomType) query.roomType = roomType;
        if (hasProjector) query.hasProjector = hasProjector === "true";

        // שליפת החדרים שעומדים בתנאים הפיזיים + הבאת כל השיבוצים שלהם (Populate)
        let rooms = await Room.find(query)
            .populate("permanentAssignments")
            .populate("temporaryAssignments")
            .populate("cancellations");

        // אם המשתמש לא הזין זמן, נחזיר פשוט את כל החדרים שענו על התנאים הפיזיים
        if (!date || !startHour || !endHour) {
            return res.json(rooms);
        }

        const searchDate = new Date(date);
        const searchDay = searchDate.getDay(); // יום בשבוע (0-6)

        // סינון לוגי: השארת רק חדרים שאין להם התנגשות
        const availableRooms = rooms.filter((room) => {
            // בדיקת שיבוץ קבוע
            const hasPermanentConflict = room.permanentAssignments.some((assign) => {
                if (assign.dayOfWeek !== searchDay) return false;

                // האם יש ביטול ספציפי לשיבוץ הקבוע הזה בתאריך הזה?
                const isCancelled = room.cancellations.some(
                    (can) =>
                        can.date.toISOString().split("T")[0] ===
                        searchDate.toISOString().split("T")[0] &&
                        can.permanentAssignment.toString() === assign._id.toString(),
                );
                if (isCancelled) return false;

                return isTimeOverlapping(
                    startHour,
                    endHour,
                    assign.startHour,
                    assign.endHour,
                );
            });

            if (hasPermanentConflict) return false;

            // ... בתוך ה-filter של ה-rooms ...

            // בדיקת שיבוץ זמני
const hasTemporaryConflict = room.temporaryAssignments.some((assign) => {
    // המרת שני התאריכים לפורמט YYYY-MM-DD נקי
    const assignDateStr = new Date(assign.date).toISOString().split("T")[0];
    const targetDateStr = new Date(date).toISOString().split("T")[0];

    const dateMatch = assignDateStr === targetDateStr;
    const timeOverlap = isTimeOverlapping(startHour, endHour, assign.startHour, assign.endHour);

    if (dateMatch && timeOverlap) {
        console.log(`נמצאה התנגשות בחדר ${room.name} בתאריך ${assignDateStr}`);
    }

    return dateMatch && timeOverlap;
            });

            return !hasTemporaryConflict;
        });

        res.json(availableRooms);
    } catch (err) {
        res.status(500).json({ message: "שגיאה בחיפוש", error: err.message });
    }
};

function isTimeOverlapping(s1, e1, s2, e2) {
    // פונקציה פנימית להמרת פורמט "HH:mm" או מספר לדקות סה"כ
    const toMinutes = (time) => {
        if (typeof time === 'number') return time * 60;
        if (typeof time === 'string' && time.includes(':')) {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        }
        return Number(time) * 60;
    };

    const start1 = toMinutes(s1);
    const end1 = toMinutes(e1);
    const start2 = toMinutes(s2);
    const end2 = toMinutes(e2);

    // בדיקת חפיפה לוגית
    return start1 < end2 && end1 > start2;
}
