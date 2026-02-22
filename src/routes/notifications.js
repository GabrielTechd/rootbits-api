const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.put('/:id/marcar-lida', notificationController.marcarLida);
router.put('/marcar-todas-lidas', notificationController.marcarTodasLidas);

module.exports = router;
