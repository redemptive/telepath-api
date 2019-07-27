const router = require('express').Router();
const postController = require('../controllers/posts');

router.get('/', postController.getAll);
router.post('/', postController.create);

module.exports = router;