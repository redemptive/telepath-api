const router = require('express').Router();
const userController = require('../controllers/users');

const { check } = require('express-validator');

router.post('/register', [
	check('email').isEmail()
], userController.create);

router.post('/authenticate', userController.authenticate);

module.exports = router;