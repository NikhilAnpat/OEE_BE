const express = require('express');
const permissionController = require('../controllers/permissionController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Protected: configuration/admin functionality
router.get('/', auth, permissionController.getAll);
router.get('/:userId', auth, permissionController.getByUserId);
router.put('/:userId', auth, permissionController.updateByUserId);
router.post('/:userId/reset-defaults', auth, permissionController.resetToDefaults);

module.exports = router;
