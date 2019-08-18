const router = require('express').Router();
const userController = require('../controllers/users');
const messageController = require('../controllers/userMessages');

router.get('/', userController.getAll);
router.get('/:name', userController.getByName);
router.post('/:name/messages', messageController.create);

module.exports = router;