const router = require('express').Router();
const userController = require('../controllers/users');

router.post('/', userController.validateAdmin, userController.makeAdmin);

module.exports = router;