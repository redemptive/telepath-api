const router = require('express').Router();
const teamController = require('../controllers/teams');
const userController = require('../controllers/users');

router.get('/', teamController.getAll);
router.post('/', userController.validateAdmin, teamController.create);
router.get('/:name', teamController.getByName);
router.post('/:name/users', userController.validateAdmin ,teamController.addUser);

module.exports = router;