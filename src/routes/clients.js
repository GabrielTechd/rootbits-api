const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/tipos-site', clientController.tiposSite);
router.get('/status-venda', clientController.statusVenda);
router.get('/formas-pagamento', clientController.formasPagamento);
router.get('/origens-lead', clientController.origensLead);
router.get('/', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), clientController.list);
router.post('/', requireRole('admin', 'ceo', 'programador', 'vendedor'), clientController.create);
router.get('/:id', requireRole('admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'), clientController.get);
router.put('/:id', requireRole('admin', 'ceo', 'programador', 'vendedor'), clientController.update);
router.delete('/:id', requireRole('admin', 'ceo'), clientController.remove);

module.exports = router;
