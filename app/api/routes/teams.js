const router = require('express').Router();
const teamController = require('../controllers/teams');
const userController = require('../controllers/users');

// GET
router.get('/', teamController.getAll);
router.get('/:name', teamController.getByName);
router.get('/:name/messages', teamController.validateMember, teamController.getMessages);

//POST
router.post('/', userController.validateAdmin, teamController.create);
router.post('/:name/users', userController.validateAdmin, teamController.addUser);
router.post('/:name/messages', teamController.sendMessage);

module.exports = router;