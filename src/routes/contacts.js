const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', contactController.create);

router.use(auth);
router.get('/', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), contactController.list);
router.get('/unread-count', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), contactController.unreadCount);
router.put('/marcar-todos-lidos', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), contactController.marcarTodosLidos);
router.get('/:id', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), contactController.get);
router.put('/:id/marcar-lido', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), contactController.marcarLido);
router.put('/:id', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), contactController.update);

module.exports = router;
