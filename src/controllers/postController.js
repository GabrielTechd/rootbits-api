const Post = require('../models/Post');
const { notify } = require('../utils/notify');
const { parseImageInput, imageToJson } = require('../utils/imageHelper');

function serializePost(post) {
  const p = post.toObject ? post.toObject() : { ...post };
  if (p.imagemPrincipal) {
    const url = imageToJson(p.imagemPrincipal);
    p.imagemPrincipal = typeof url === 'string' ? url : (typeof p.imagemPrincipal === 'string' ? p.imagemPrincipal : null);
  }
  if (p.imagensAdicionais && p.imagensAdicionais.length) {
    p.imagensAdicionais = p.imagensAdicionais.map((img) => {
      const url = imageToJson(img);
      return typeof url === 'string' ? url : (typeof img === 'string' ? img : null);
    }).filter(Boolean);
  }
  return p;
}

exports.list = async (req, res) => {
  try {
    const { publicado, page = 1, limit = 20 } = req.query;
    const q = {};
    if (publicado !== undefined) q.publicado = publicado === 'true';
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));
    const [posts, total] = await Promise.all([
      Post.find(q).populate('autor', 'nome').populate('clienteRef', 'nome nomeEmpresa').sort({ ordem: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit, 10) || 20).lean(),
      Post.countDocuments(q)
    ]);
    const dados = posts.map((p) => serializePost(p));
    res.json({ dados, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, descricao, publicado, ordem, tags, clienteRef, imagemPrincipal, imagensAdicionais } = req.body;
    if (!titulo || !descricao) return res.status(400).json({ erro: 'Título e descrição obrigatórios' });
    const mainImg = parseImageInput(imagemPrincipal);
    if (!mainImg) return res.status(400).json({ erro: 'Imagem principal obrigatória (envie em base64 ou data URL)' });
    const adicionais = [];
    const raw = Array.isArray(imagensAdicionais) ? imagensAdicionais : (imagensAdicionais ? [imagensAdicionais] : []);
    for (const img of raw.slice(0, 10)) {
      const parsed = parseImageInput(img);
      if (parsed) adicionais.push(parsed);
    }
    const post = await Post.create({
      titulo,
      descricao,
      imagemPrincipal: mainImg,
      imagensAdicionais: adicionais,
      autor: req.user._id,
      publicado: publicado !== 'false' && publicado !== false,
      ordem: parseInt(ordem, 10) || 0,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : []),
      clienteRef: clienteRef || undefined
    });
    await post.populate([{ path: 'autor', select: 'nome' }, { path: 'clienteRef', select: 'nome nomeEmpresa' }]);
    await notify('post_criado', 'Novo projeto', `Projeto "${titulo}" foi criado.`, { global: true, link: `/posts/${post._id}`, criadoPor: req.user._id });
    res.status(201).json(serializePost(post));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('autor', 'nome').populate('clienteRef', 'nome nomeEmpresa');
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    res.json(serializePost(post));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    const { titulo, descricao, publicado, ordem, tags, clienteRef, imagemPrincipal, imagensAdicionais } = req.body;
    if (titulo !== undefined) post.titulo = titulo;
    if (descricao !== undefined) post.descricao = descricao;
    if (publicado !== undefined) post.publicado = publicado === 'true' || publicado === true;
    if (ordem !== undefined) post.ordem = parseInt(ordem, 10);
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : post.tags);
    if (clienteRef !== undefined) post.clienteRef = clienteRef || undefined;
    const mainImg = parseImageInput(imagemPrincipal);
    if (mainImg) post.imagemPrincipal = mainImg;
    if (imagensAdicionais !== undefined) {
      const raw = Array.isArray(imagensAdicionais) ? imagensAdicionais : [imagensAdicionais];
      post.imagensAdicionais = raw.slice(0, 10).map(parseImageInput).filter(Boolean);
    }
    await post.save();
    await post.populate([{ path: 'autor', select: 'nome' }, { path: 'clienteRef', select: 'nome nomeEmpresa' }]);
    await notify('post_atualizado', 'Projeto atualizado', `Projeto "${post.titulo}" foi atualizado.`, { global: true, link: `/posts/${post._id}`, criadoPor: req.user._id });
    res.json(serializePost(post));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};
