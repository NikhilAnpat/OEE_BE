const express = require('express');
const energyReadingController = require('../controllers/energyReadingController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, energyReadingController.list);
router.post('/', auth, energyReadingController.create);
router.get('/kpi', auth, energyReadingController.kpi);

module.exports = router;
