const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// הגדרת הנתיבים (שימי לב שאנחנו משתמשים ב-router ולא ב-app)
router.get('/', roomController.getAllRooms);          // קבלת כל החדרים
router.get('/:id', roomController.getRoomById);      // קבלת חדר לפי ID
router.post('/', roomController.createRoom);         // יצירת חדר חדש
router.put('/:id', roomController.updateRoom);       // עדכון חדר
router.delete('/:id', roomController.deleteRoom);    // מחיקת חדר

module.exports = router; // ייצוא הראוטר כדי ש-index.js יוכל להשתמש בו