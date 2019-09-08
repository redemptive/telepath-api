const router = require('express').Router();
const userController = require('../controllers/users');

router.get('/', userController.getAllMyMessages);

module.exports = router;