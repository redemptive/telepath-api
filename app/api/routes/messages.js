const router = require('express').Router();
const messageController = require('../controllers/messages');

router.get('/', messageController.getAll);
router.post('/', messageController.create);

module.exports = router;