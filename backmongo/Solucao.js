// Solucao.js
const mongoose = require('mongoose');

const SolucaoSchema = new mongoose.Schema({
  descricao: String,
  desafioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Desafio' },
});

module.exports = mongoose.model('Solucao', SolucaoSchema);
