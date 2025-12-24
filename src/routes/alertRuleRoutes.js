const express = require('express');
const alertRuleController = require('../controllers/alertRuleController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, alertRuleController.list);
router.post('/', auth, alertRuleController.create);
router.get('/:id', auth, alertRuleController.getById);
router.put('/:id', auth, alertRuleController.updateById);
router.delete('/:id', auth, alertRuleController.deleteById);

module.exports = router;
