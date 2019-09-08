const router = require('express').Router();
const userController = require('../controllers/users');

router.get('/', userController.getAll);
router.get('/:name', userController.getByName);
router.post('/:name/messages', userController.sendMessage);

module.exports = router;