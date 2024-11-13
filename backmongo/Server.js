// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const desafioRoutes = require('./Desafios');
const contaRoutes = require('./Contas');

// Iniciar o servidor
const app = express();

// Middleware para analisar JSON
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/desafioDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Definir as rotas
app.use('/api/desafios', desafioRoutes);
app.use('/api/contas', contaRoutes);

// Rodar o servidor
const port = 8080;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
