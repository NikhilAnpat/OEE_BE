const express = require('express');
const alertController = require('../controllers/alertController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, alertController.list);
router.post('/', auth, alertController.create);
router.delete('/:id', auth, alertController.deleteById);

module.exports = router;
