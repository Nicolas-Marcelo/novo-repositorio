// Contas.js
const express = require('express');
const router = express.Router();

// Aqui você pode implementar as rotas relacionadas aos usuários
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Rotas de contas ainda não implementadas.' });
});

module.exports = router;
