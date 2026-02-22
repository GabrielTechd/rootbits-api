const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, default: 'image/jpeg' }
}, { _id: false });

const postSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  descricao: { type: String, required: true },
  imagemPrincipal: { type: imageSchema, required: true },
  imagensAdicionais: [imageSchema],
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publicado: { type: Boolean, default: true },
  ordem: { type: Number, default: 0 },
  tags: [String],
  clienteRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
}, { timestamps: true });

postSchema.index({ publicado: 1, ordem: -1 });
postSchema.index({ autor: 1 });

postSchema.methods.toJSON = function () {
  const post = this.toObject();
  const { parseImageInput, imageToJson } = require('../utils/imageHelper');
  if (post.imagemPrincipal && typeof post.imagemPrincipal === 'object') {
    const url = imageToJson(post.imagemPrincipal);
    post.imagemPrincipal = url || null;
  }
  if (post.imagensAdicionais && post.imagensAdicionais.length) {
    post.imagensAdicionais = post.imagensAdicionais.map((img) => imageToJson(img) || null).filter(Boolean);
  }
  return post;
};

module.exports = mongoose.model('Post', postSchema);
