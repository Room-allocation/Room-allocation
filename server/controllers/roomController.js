const Room = require('../models/Room');

// 1. קבלת כל החדרים
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

// 2. יצירת חדר חדש
exports.createRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. עדכון חדר קיים
exports.updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. מחיקת חדר
exports.deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};