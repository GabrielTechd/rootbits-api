const mongoose = require('mongoose');

const TIPOS_SITE = ['landing', 'institucional', 'ecommerce', 'blog', 'sistema', 'app', 'outro'];
const STATUS_VENDA = ['prospect', 'proposta_enviada', 'negociacao', 'fechado', 'perdido', 'ativo', 'encerrado', 'inativo'];
const FORMA_PAGAMENTO = ['a_vista', 'parcelado_2x', 'parcelado_3x', 'parcelado_4x', 'parcelado_5x', 'parcelado_6x', 'parcelado_12x', 'mensalidade', 'combinado', 'outro'];
const ORIGEM_LEAD = ['indicacao', 'google', 'instagram', 'facebook', 'linkedin', 'site', 'whatsapp', 'telefone', 'email', 'evento', 'outro'];

const clientSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  telefone: { type: String, trim: true },
  telefone2: { type: String, trim: true },
  celular: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  cargo: { type: String, trim: true },
  nomeEmpresa: { type: String, trim: true },
  razaoSocial: { type: String, trim: true },
  cnpj: { type: String, trim: true },
  ramoAtividade: { type: String, trim: true },
  tipoSite: { type: String, enum: TIPOS_SITE, default: 'institucional' },
  informacoesAdicionais: { type: String },
  preco: { type: Number },
  precoPago: { type: Number },
  valorEntrada: { type: Number },
  valorParcelas: { type: Number },
  formaPagamento: { type: String, enum: FORMA_PAGAMENTO },
  quantidadeParcelas: { type: Number },
  urlSite: { type: String, trim: true },
  dominio: { type: String, trim: true },
  hospedagem: { type: String, trim: true },
  status: { type: String, enum: STATUS_VENDA, default: 'prospect' },
  etapa: { type: String, trim: true },
  probabilidade: { type: Number, min: 0, max: 100 },
  origemLead: { type: String, enum: ORIGEM_LEAD },
  dataContrato: { type: Date },
  dataProposta: { type: Date },
  dataFechamento: { type: Date },
  dataEntregaPrevista: { type: Date },
  dataPrimeiroContato: { type: Date },
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  endereco: {
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  observacoes: { type: String },
  observacoesInternas: { type: String }
}, { timestamps: true });

clientSchema.index({ nome: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ vendedor: 1 });
clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);
module.exports.TIPOS_SITE = TIPOS_SITE;
module.exports.STATUS_VENDA = STATUS_VENDA;
module.exports.FORMA_PAGAMENTO = FORMA_PAGAMENTO;
module.exports.ORIGEM_LEAD = ORIGEM_LEAD;
