const router = require('express').Router();
const teamController = require('../controllers/teams');

router.get('/', teamController.getAll);
router.post('/', teamController.create);
router.get('/:name', teamController.getByName);
router.post('/:name/users', teamController.addUser);

module.exports = router;