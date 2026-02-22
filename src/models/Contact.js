const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  telefone: { type: String, trim: true },
  mensagem: { type: String, required: true },
  lido: { type: Boolean, default: false },
  respondido: { type: Boolean, default: false },
  observacao: { type: String }
}, { timestamps: true });

contactSchema.index({ lido: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
