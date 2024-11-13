// Desafios.js
const express = require('express');
const router = express.Router();
const Desafio = require('./Desafio');

// Rota para obter todos os desafios
router.get('/', async (req, res) => {
  try {
    const desafiosMongo = await Desafio.find();
    res.status(200).json(desafiosMongo);
  } catch (error) {
    console.error('Erro ao obter desafios:', error);
    res.status(500).json({ message: 'Erro ao obter desafios' });
  }
});

// Rota para criar um novo desafio
router.post('/', async (req, res) => {
  try {
    const desafio = new Desafio(req.body);
    await desafio.save();
    res.status(201).json(desafio);
  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    res.status(500).json({ message: 'Erro ao criar desafio' });
  }
});

module.exports = router;
