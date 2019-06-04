const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

router.get('/', userController.getAll);
router.get('/:name', userController.getByName);

module.exports = router;