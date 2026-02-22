require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const clientRoutes = require('./routes/clients');
const ticketRoutes = require('./routes/tickets');
const contactRoutes = require('./routes/contacts');
const notificationRoutes = require('./routes/notifications');

connectDB();

const app = express();

const corsOrigins = process.env.CORS_ORIGIN;
const corsOptions = corsOrigins
  ? {
      origin: corsOrigins.split(',').map((o) => o.trim()).filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  : { origin: true };
app.use(cors(corsOptions));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.get('/api', (req, res) => res.json({ app: 'Rootbits API', health: '/api/health', auth: '/api/auth', posts: '/api/posts', clientes: '/api/clientes', chamados: '/api/chamados', contatos: '/api/contatos', notificacoes: '/api/notificacoes' }));
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'Rootbits API' }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/chamados', ticketRoutes);
app.use('/api/contatos', contactRoutes);
app.use('/api/notificacoes', notificationRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Arquivo(s) muito grande(s). Reduza o tamanho das imagens ou envie menos fotos.' });
  }
  console.error(err);
  res.status(500).json({ erro: err.message || 'Erro interno' });
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Rootbits API rodando na porta ${PORT}`));
}

module.exports = app;
