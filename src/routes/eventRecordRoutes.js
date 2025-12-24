const express = require('express');
const eventRecordController = require('../controllers/eventRecordController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, eventRecordController.list);
router.post('/', auth, eventRecordController.create);
router.get('/:id', auth, eventRecordController.getById);
router.put('/:id', auth, eventRecordController.updateById);
router.delete('/:id', auth, eventRecordController.deleteById);

module.exports = router;
