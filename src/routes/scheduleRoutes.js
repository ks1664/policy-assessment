const express = require('express');
const { createScheduledMessage } = require('../controllers/scheduleController');

const router = express.Router();
router.post('/schedule', createScheduledMessage);

module.exports = router;
