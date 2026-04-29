const express = require('express');
const router = express.Router();
const controller = require('../controllers/permanentAssignmentController');

router.post('/', controller.createAssignment);
router.get('/', controller.getAllAssignments);
router.delete('/:id', controller.deleteAssignment);
router.put('/:id', controller.updateAssignment);

module.exports = router;