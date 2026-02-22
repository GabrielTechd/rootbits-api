const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  try {
    const { lida, page = 1, limit = 30 } = req.query;
    const q = { $or: [{ destinatarios: req.user._id }, { global: true }] };
    if (lida === 'true') q.lidaPor = req.user._id;
    if (lida === 'false') q.lidaPor = { $nin: [req.user._id] };
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));
    const [notifications, total] = await Promise.all([
      Notification.find(q).populate('criadoPor', 'nome').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10) || 30).lean(),
      Notification.countDocuments(q)
    ]);
    const dados = notifications.map(n => ({
      ...n,
      lida: (n.lidaPor || []).some(id => id && id.toString() === req.user._id.toString())
    }));
    res.json({ dados, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.marcarLida = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ erro: 'Notificação não encontrada' });
    const userId = req.user._id;
    if (!notif.lidaPor) notif.lidaPor = [];
    if (!notif.lidaPor.some(id => id.toString() === userId.toString())) {
      notif.lidaPor.push(userId);
      await notif.save();
    }
    res.json(notif);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.marcarTodasLidas = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ destinatarios: req.user._id }, { global: true }], lidaPor: { $ne: req.user._id } },
      { $addToSet: { lidaPor: req.user._id } }
    );
    res.json({ mensagem: 'Todas marcadas como lidas' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $and: [
        { $or: [{ destinatarios: req.user._id }, { global: true }] },
        { $or: [{ lidaPor: { $exists: false } }, { lidaPor: { $nin: [req.user._id] } }] }
      ]
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};
