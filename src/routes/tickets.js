const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/status', ticketController.statusList);
router.get('/prioridades', ticketController.prioridades);
router.get('/', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), ticketController.list);
router.post('/', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), ticketController.create);
router.get('/:id', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), ticketController.get);
router.put('/:id', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), ticketController.update);
router.post('/:id/comentarios', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), ticketController.addComment);
router.delete('/:id', requireRole('admin', 'ceo'), ticketController.remove);

module.exports = router;
