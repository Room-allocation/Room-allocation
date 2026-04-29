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