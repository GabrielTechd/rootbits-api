const Client = require('../models/Client');
const { notify } = require('../utils/notify');

const toNumber = (v) => (v != null && v !== '' ? Number(v) : undefined);
const toDate = (v) => (v ? new Date(v) : undefined);

function mapBodyToClient(body) {
  return {
    nome: body.nome,
    email: body.email,
    telefone: body.telefone,
    telefone2: body.telefone2,
    celular: body.celular,
    whatsapp: body.whatsapp,
    cargo: body.cargo,
    nomeEmpresa: body.nomeEmpresa,
    razaoSocial: body.razaoSocial,
    cnpj: body.cnpj,
    ramoAtividade: body.ramoAtividade,
    tipoSite: body.tipoSite,
    informacoesAdicionais: body.informacoesAdicionais,
    preco: toNumber(body.preco),
    precoPago: toNumber(body.precoPago),
    valorEntrada: toNumber(body.valorEntrada),
    valorParcelas: toNumber(body.valorParcelas),
    formaPagamento: body.formaPagamento,
    quantidadeParcelas: body.quantidadeParcelas != null ? parseInt(body.quantidadeParcelas, 10) : undefined,
    urlSite: body.urlSite,
    dominio: body.dominio,
    hospedagem: body.hospedagem,
    status: body.status || 'prospect',
    etapa: body.etapa,
    probabilidade: body.probabilidade != null ? Math.min(100, Math.max(0, parseInt(body.probabilidade, 10))) : undefined,
    origemLead: body.origemLead,
    dataContrato: toDate(body.dataContrato),
    dataProposta: toDate(body.dataProposta),
    dataFechamento: toDate(body.dataFechamento),
    dataEntregaPrevista: toDate(body.dataEntregaPrevista),
    dataPrimeiroContato: toDate(body.dataPrimeiroContato),
    vendedor: body.vendedor || undefined,
    responsavel: body.responsavel || undefined,
    endereco: body.endereco,
    observacoes: body.observacoes,
    observacoesInternas: body.observacoesInternas
  };
}

exports.list = async (req, res) => {
  try {
    const { status, tipoSite, vendedor, origemLead, page = 1, limit = 20, busca } = req.query;
    const q = {};
    if (status) q.status = status;
    if (tipoSite) q.tipoSite = tipoSite;
    if (vendedor) q.vendedor = vendedor;
    if (origemLead) q.origemLead = origemLead;
    if (busca) {
      q.$or = [
        { nome: new RegExp(busca, 'i') },
        { email: new RegExp(busca, 'i') },
        { nomeEmpresa: new RegExp(busca, 'i') },
        { cnpj: new RegExp(busca, 'i') }
      ];
    }
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));
    const [clients, total] = await Promise.all([
      Client.find(q).populate('vendedor', 'nome').populate('responsavel', 'nome').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10) || 20).lean(),
      Client.countDocuments(q)
    ]);
    res.json({ dados: clients, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body;
    if (!body.nome || !body.email) return res.status(400).json({ erro: 'Nome e email obrigatórios' });
    const data = mapBodyToClient(body);
    const client = await Client.create(data);
    await client.populate(['vendedor', 'responsavel']);
    await notify('cliente_criado', 'Novo cliente', `Cliente "${client.nome}" foi cadastrado.`, { global: true, link: `/clientes/${client._id}`, dados: { clientId: client._id }, criadoPor: req.user._id });
    res.status(201).json(client);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('vendedor', 'nome email').populate('responsavel', 'nome email');
    if (!client) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(client);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ erro: 'Cliente não encontrado' });
    const data = mapBodyToClient(req.body);
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) client[key] = data[key];
    });
    await client.save();
    await client.populate(['vendedor', 'responsavel']);
    await notify('cliente_atualizado', 'Cliente atualizado', `Cliente "${client.nome}" foi atualizado.`, { global: true, link: `/clientes/${client._id}`, criadoPor: req.user._id });
    res.json(client);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.tiposSite = (req, res) => res.json({ tipos: Client.TIPOS_SITE });
exports.statusVenda = (req, res) => res.json({ status: Client.STATUS_VENDA });
exports.formasPagamento = (req, res) => res.json({ formas: Client.FORMA_PAGAMENTO });
exports.origensLead = (req, res) => res.json({ origens: Client.ORIGEM_LEAD });
