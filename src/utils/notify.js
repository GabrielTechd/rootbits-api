const Notification = require('../models/Notification');
const User = require('../models/User');

async function notify(tipo, titulo, mensagem, options = {}) {
  const { destinatarios = [], link, dados, global: isGlobal = false, criadoPor, excludeUser } = options;
  let userIds = destinatarios;
  if (isGlobal) {
    const users = await User.find({ ativo: true }).select('_id').lean();
    userIds = users.map(u => u._id).filter(id => !excludeUser || !id.equals(excludeUser));
  }
  if (userIds.length === 0 && !isGlobal) return null;
  const doc = await Notification.create({
    tipo,
    titulo,
    mensagem,
    destinatarios: userIds,
    link,
    dados,
    global: isGlobal,
    criadoPor
  });
  return doc;
}

module.exports = { notify };
