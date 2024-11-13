// Desafio.js
const mongoose = require('mongoose');

const DesafioSchema = new mongoose.Schema({
  desafio: String,
  recompensa: String,
  dataLimite: Date,
  descricao: String,
  solucoes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Solucao' }],
  comunicacao: String,
  criterios: [String],
  autorId: String,
});

module.exports = mongoose.model('Desafio', DesafioSchema);
