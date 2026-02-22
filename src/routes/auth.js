const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', auth, authController.me);
router.put('/me', auth, authController.updateMe);
router.put('/alterar-senha', auth, authController.alterarSenha);

module.exports = router;
