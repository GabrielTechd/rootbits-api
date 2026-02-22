const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { imageToJson, parseImageInput } = require('../utils/imageHelper');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

function serializeUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.senha;
  if (u.avatar) u.avatar = imageToJson(u.avatar);
  return u;
}

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
    res.json({ token, usuario: serializeUser(user) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-senha -__v');
    res.json(serializeUser(user));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { nome, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    if (nome !== undefined) user.nome = nome;
    if (avatar !== undefined) {
      if (avatar === null || avatar === '') {
        user.avatar = undefined;
      } else {
        const parsed = parseImageInput(avatar);
        if (parsed) user.avatar = parsed;
      }
    }
    await user.save();
    res.json(serializeUser(user));
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
