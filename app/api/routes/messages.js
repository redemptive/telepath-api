const router = require('express').Router();
const messageController = require('../controllers/userMessages');

router.get('/', messageController.getAll);

module.exports = router;