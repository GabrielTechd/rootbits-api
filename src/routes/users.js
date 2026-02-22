const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), userController.list);
router.get('/roles', requireRole('admin', 'ceo'), userController.roles);
router.post('/', requireRole('admin', 'ceo'), userController.create);
router.get('/:id', userController.get);
router.put('/:id', requireRole('admin', 'ceo'), userController.update);
router.delete('/:id', requireRole('admin', 'ceo'), userController.remove);

module.exports = router;
