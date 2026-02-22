/**
 * Cria o primeiro usuário admin. Uso: node src/scripts/seed-admin.js
 * Configure NOME, EMAIL e SENHA no .env ou edite abaixo.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'User'));

const NOME = process.env.ADMIN_NOME || 'Administrador';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@rootbits.com.br';
const SENHA = process.env.ADMIN_SENHA || 'admin123';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rootbits');
  const exists = await User.findOne({ email: EMAIL });
  if (exists) {
    console.log('Usuário já existe:', EMAIL);
    process.exit(0);
    return;
  }
  await User.create({ nome: NOME, email: EMAIL, senha: SENHA, role: 'admin' });
  console.log('Admin criado:', EMAIL);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
