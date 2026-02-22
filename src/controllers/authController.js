const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });
    const user = await User.findOne({ email }).select('+senha');
    if (!user) return res.status(401).json({ erro: 'Credenciais inválidas' });
    if (!user.ativo) return res.status(401).json({ erro: 'Usuário inativo' });
    const ok = await user.comparePassword(senha);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });
    await User.updateOne({ _id: user._id }, { ultimoAcesso: new Date() });
    const token = signToken(user._id);
    const u = user.toObject();
    delete u.senha;
    res.json({ token, usuario: u });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: 'Senha atual e nova senha obrigatórias' });
    const user = await User.findById(req.user._id).select('+senha');
    const ok = await user.comparePassword(senhaAtual);
    if (!ok) return res.status(401).json({ erro: 'Senha atual incorreta' });
    user.senha = novaSenha;
    await user.save();
    res.json({ mensagem: 'Senha alterada com sucesso' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};
