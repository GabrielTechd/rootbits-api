const Contact = require('../models/Contact');
const { notify } = require('../utils/notify');

exports.create = async (req, res) => {
  try {
    const { nome, email, telefone, mensagem } = req.body;
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ erro: 'Nome, email e mensagem são obrigatórios' });
    }
    const contact = await Contact.create({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      telefone: (telefone || '').trim(),
      mensagem: mensagem.trim()
    });
    await notify('contato_novo', 'Novo contato pelo site', `${nome} (${email}) enviou uma mensagem.`, {
      global: true,
      link: `/contatos/${contact._id}`,
      dados: { contactId: contact._id }
    });
    res.status(201).json({
      mensagem: 'Mensagem enviada com sucesso. Entraremos em contato em breve.',
      id: contact._id
    });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { lido, page = 1, limit = 20 } = req.query;
    const q = {};
    if (lido !== undefined) q.lido = lido === 'true';
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));
    const [dados, total] = await Promise.all([
      Contact.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10) || 20).lean(),
      Contact.countDocuments(q)
    ]);
    res.json({ dados, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ erro: 'Contato não encontrado' });
    res.json(contact);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.marcarLido = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { lido: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ erro: 'Contato não encontrado' });
    res.json(contact);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.marcarTodosLidos = async (req, res) => {
  try {
    await Contact.updateMany({ lido: false }, { lido: true });
    res.json({ mensagem: 'Todos marcados como lidos' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { lido, respondido, observacao } = req.body;
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ erro: 'Contato não encontrado' });
    if (lido !== undefined) contact.lido = lido === true;
    if (respondido !== undefined) contact.respondido = respondido === true;
    if (observacao !== undefined) contact.observacao = observacao;
    await contact.save();
    res.json(contact);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ lido: false });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};
