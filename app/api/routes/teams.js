const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teams');

router.get('/', teamController.getAll);
router.post('/', teamController.create);

module.exports = router;