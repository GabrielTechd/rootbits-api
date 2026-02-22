const User = require('../models/User');
const { notify } = require('../utils/notify');
const { parseImageInput, imageToJson } = require('../utils/imageHelper');

function serializeUser(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.senha;
  if (u.avatar) u.avatar = imageToJson(u.avatar);
  return u;
}

exports.list = async (req, res) => {
  try {
    const { role, ativo, page = 1, limit = 20 } = req.query;
    const q = {};
    if (role) q.role = role;
    if (ativo !== undefined) q.ativo = ativo === 'true';
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));
    const [users, total] = await Promise.all([
      User.find(q).select('-senha -__v').sort({ nome: 1 }).skip(skip).limit(parseInt(limit, 10) || 20).lean(),
      User.countDocuments(q)
    ]);
    const dados = users.map(u => ({ ...u, avatar: u.avatar ? imageToJson(u.avatar) : null }));
    res.json({ dados, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha obrigatórios' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ erro: 'Email já cadastrado' });
    const user = await User.create({ nome, email, senha, role: role || 'suporte' });
    await notify('usuario_convite', 'Novo usuário', `${nome} foi adicionado ao sistema.`, { global: true, criadoPor: req.user._id });
    res.status(201).json(serializeUser(user));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-senha -__v');
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(serializeUser(user));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nome, email, role, ativo, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    if (nome !== undefined) user.nome = nome;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (ativo !== undefined) user.ativo = ativo;
    const parsedAvatar = parseImageInput(avatar);
    if (parsedAvatar) user.avatar = parsedAvatar;
    await user.save();
    res.json(serializeUser(user));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({ erro: 'Você não pode excluir sua própria conta' });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.roles = (req, res) => {
  res.json({ roles: User.ROLES });
};
