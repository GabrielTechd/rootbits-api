const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['admin', 'ceo', 'programador', 'designer', 'vendedor', 'suporte'];
const ROLE_LEVEL = { admin: 100, ceo: 90, programador: 70, designer: 60, vendedor: 50, suporte: 40 };

const avatarSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, default: 'image/jpeg' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'suporte' },
  ativo: { type: Boolean, default: true },
  avatar: { type: avatarSchema },
  ultimoAcesso: { type: Date }
}, { timestamps: true });

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.senha);
};

userSchema.methods.hasLevel = function (minRole) {
  return (ROLE_LEVEL[this.role] || 0) >= (ROLE_LEVEL[minRole] || 0);
};

userSchema.virtual('nivel').get(function () {
  return ROLE_LEVEL[this.role] || 0;
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
module.exports.ROLE_LEVEL = ROLE_LEVEL;
