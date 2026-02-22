const mongoose = require('mongoose');

const STATUS_CHAMADO = ['aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado', 'cancelado'];
const PRIORIDADE = ['baixa', 'media', 'alta', 'urgente'];

const anexoSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, default: 'application/octet-stream' },
  filename: { type: String }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  descricao: { type: String, required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  abertoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: STATUS_CHAMADO, default: 'aberto' },
  prioridade: { type: String, enum: PRIORIDADE, default: 'media' },
  tipo: { type: String, enum: ['alteracao', 'correcao', 'nova_funcionalidade', 'suporte', 'outro'], default: 'alteracao' },
  comentarios: [{
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    texto: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  dataResolucao: { type: Date },
  anexos: [anexoSchema]
}, { timestamps: true });

ticketSchema.index({ cliente: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ responsavel: 1 });
ticketSchema.index({ abertoPor: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.STATUS_CHAMADO = STATUS_CHAMADO;
module.exports.PRIORIDADE = PRIORIDADE;
