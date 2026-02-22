const mongoose = require('mongoose');

const TIPOS = [
  'ticket_criado', 'ticket_atribuido', 'ticket_atualizado', 'ticket_comentario', 'ticket_resolvido',
  'cliente_criado', 'cliente_atualizado',
  'post_criado', 'post_atualizado',
  'contato_novo',
  'usuario_convite', 'sistema'
];

const notificationSchema = new mongoose.Schema({
  tipo: { type: String, enum: TIPOS, required: true },
  titulo: { type: String, required: true },
  mensagem: { type: String },
  destinatarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lidaPor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  link: { type: String },
  dados: { type: mongoose.Schema.Types.Mixed },
  global: { type: Boolean, default: false },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

notificationSchema.index({ destinatarios: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.TIPOS = TIPOS;
