const express = require('express');
const { searchByUsername, aggregateByUser } = require('../controllers/policyController');

const router = express.Router();
router.get('/search', searchByUsername);
router.get('/aggregate-by-user', aggregateByUser);

module.exports = router;
