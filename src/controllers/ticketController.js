const Ticket = require('../models/Ticket');
const { notify } = require('../utils/notify');
const { parseImageInput, imageToJson } = require('../utils/imageHelper');

function serializeTicket(ticket) {
  const t = ticket.toObject ? ticket.toObject() : ticket;
  if (t.anexos && t.anexos.length) {
    t.anexos = t.anexos.map(a => ({
      filename: a.filename,
      contentType: a.contentType,
      dataUrl: imageToJson(a)
    }));
  }
  return t;
}

exports.list = async (req, res) => {
  try {
    const { status, cliente, responsavel, prioridade, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (cliente) q.cliente = cliente;
    if (responsavel) q.responsavel = responsavel;
    if (prioridade) q.prioridade = prioridade;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));
    const [tickets, total] = await Promise.all([
      Ticket.find(q).populate('cliente', 'nome nomeEmpresa').populate('responsavel', 'nome').populate('abertoPor', 'nome').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10) || 20).lean(),
      Ticket.countDocuments(q)
    ]);
    const dados = tickets.map(t => {
      const { anexos, ...rest } = t;
      return { ...rest, anexos: (anexos || []).map(a => ({ filename: a.filename, contentType: a.contentType })) };
    });
    res.json({ dados, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, descricao, cliente, responsavel, prioridade, tipo, anexos: rawAnexos } = req.body;
    if (!titulo || !descricao || !cliente) return res.status(400).json({ erro: 'Título, descrição e cliente obrigatórios' });
    const anexos = [];
    const list = Array.isArray(rawAnexos) ? rawAnexos : (rawAnexos ? [rawAnexos] : []);
    for (const a of list.slice(0, 5)) {
      const parsed = parseImageInput(typeof a === 'object' && a.data !== undefined ? a : a);
      if (parsed) {
        anexos.push({
          ...parsed,
          filename: typeof a === 'object' && a.filename ? a.filename : undefined
        });
      }
    }
    const ticket = await Ticket.create({
      titulo,
      descricao,
      cliente,
      responsavel: responsavel || undefined,
      abertoPor: req.user._id,
      prioridade: prioridade || 'media',
      tipo: tipo || 'alteracao',
      anexos
    });
    await ticket.populate(['cliente', 'responsavel', 'abertoPor']);
    await notify('ticket_criado', 'Novo chamado', `Chamado "${titulo}" aberto para ${ticket.cliente?.nome || 'cliente'}.`, {
      global: true,
      link: `/chamados/${ticket._id}`,
      dados: { ticketId: ticket._id, clienteId: ticket.cliente._id },
      criadoPor: req.user._id
    });
    if (ticket.responsavel) {
      await notify('ticket_atribuido', 'Chamado atribuído', `Você foi atribuído ao chamado "${titulo}".`, {
        destinatarios: [ticket.responsavel._id],
        link: `/chamados/${ticket._id}`,
        criadoPor: req.user._id
      });
    }
    res.status(201).json(serializeTicket(ticket));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('cliente', 'nome nomeEmpresa email telefone')
      .populate('responsavel', 'nome email')
      .populate('abertoPor', 'nome')
      .populate('comentarios.autor', 'nome');
    if (!ticket) return res.status(404).json({ erro: 'Chamado não encontrado' });
    res.json(serializeTicket(ticket));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('cliente responsavel');
    if (!ticket) return res.status(404).json({ erro: 'Chamado não encontrado' });
    const { titulo, descricao, status, responsavel, prioridade, tipo, anexos: rawAnexos } = req.body;
    if (titulo !== undefined) ticket.titulo = titulo;
    if (descricao !== undefined) ticket.descricao = descricao;
    if (status !== undefined) {
      ticket.status = status;
      if (status === 'resolvido' || status === 'fechado') ticket.dataResolucao = new Date();
    }
    if (responsavel !== undefined) {
      const prevResponsavel = ticket.responsavel?._id?.toString();
      ticket.responsavel = responsavel || undefined;
      if (responsavel && responsavel !== prevResponsavel) {
        await notify('ticket_atribuido', 'Chamado atribuído', `Você foi atribuído ao chamado "${ticket.titulo}".`, {
          destinatarios: [responsavel],
          link: `/chamados/${ticket._id}`,
          criadoPor: req.user._id
        });
      }
    }
    if (prioridade !== undefined) ticket.prioridade = prioridade;
    if (tipo !== undefined) ticket.tipo = tipo;
    if (rawAnexos !== undefined) {
      const list = Array.isArray(rawAnexos) ? rawAnexos : [rawAnexos];
      const newOnes = list.slice(0, 5).map(a => {
        const parsed = parseImageInput(typeof a === 'object' && a.data !== undefined ? a : a);
        if (!parsed) return null;
        return { ...parsed, filename: typeof a === 'object' && a.filename ? a.filename : undefined };
      }).filter(Boolean);
      ticket.anexos = [...(ticket.anexos || []), ...newOnes];
    }
    await ticket.save();
    await notify('ticket_atualizado', 'Chamado atualizado', `Chamado "${ticket.titulo}" foi atualizado.`, { global: true, link: `/chamados/${ticket._id}`, criadoPor: req.user._id });
    await ticket.populate(['cliente', 'responsavel', 'abertoPor']);
    res.json(serializeTicket(ticket));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ erro: 'Texto do comentário obrigatório' });
    const ticket = await Ticket.findById(req.params.id).populate('cliente responsavel');
    if (!ticket) return res.status(404).json({ erro: 'Chamado não encontrado' });
    ticket.comentarios.push({ autor: req.user._id, texto });
    await ticket.save();
    await ticket.populate('comentarios.autor', 'nome');
    await notify('ticket_comentario', 'Novo comentário', `Comentário no chamado "${ticket.titulo}".`, {
      global: true,
      excludeUser: req.user._id,
      link: `/chamados/${ticket._id}`,
      criadoPor: req.user._id
    });
    res.json(serializeTicket(ticket));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ erro: 'Chamado não encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.statusList = (req, res) => res.json({ status: Ticket.STATUS_CHAMADO });
exports.prioridades = (req, res) => res.json({ prioridades: Ticket.PRIORIDADE });
