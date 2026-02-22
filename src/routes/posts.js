const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth, requireRole, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, postController.list);
router.get('/:id', optionalAuth, postController.get);

router.use(auth);
router.post('/', requireRole('admin', 'ceo', 'programador', 'designer'), postController.create);
router.put('/:id', requireRole('admin', 'ceo', 'programador', 'designer'), postController.update);
router.delete('/:id', requireRole('admin', 'ceo'), postController.remove);

module.exports = router;
