const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teams');

router.get('/', teamController.getAll);
router.post('/', teamController.create);
router.get('/:name', teamController.getByName);

module.exports = router;