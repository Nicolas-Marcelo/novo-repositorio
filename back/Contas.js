const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const { getAuth } = require('firebase-admin/auth');

router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    const infoTokin = await getAuth().verifyIdToken(idToken);
    const uid = infoTokin.uid;
    const email = infoTokin.email;

    const userRef = db.collection('usuarios').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        questionarioCompleto: false,
        email: email,  // Armazenar o email
      });
      console.log('Novo usuário criado');
      res.status(200).json({ uid, questionarioCompleto: false });
    } else {
      res.status(200).json({ uid, questionarioCompleto: userDoc.data().questionarioCompleto });
    }
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).json({ message: 'Erro ao autenticar usuário', error: error.message });
  }
});

// Endpoint para obter os dados completos do usuário
router.get('/user', async (req, res) => {
  try {
    const { uid } = req.query; // O UID será enviado como query parameter

    if (!uid) {
      return res.status(400).json({ message: 'UID é obrigatório' });
    }

    const userRef = db.collection('usuarios').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();
    res.status(200).json({
      uid: userDoc.id,
      email: userData.email,  // Retorna o email armazenado
      questionarioCompleto: userData.questionarioCompleto,
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ message: 'Erro ao obter dados do usuário', error: error.message });
  }
});


// Rota para logout
router.post('/logout', (req, res) => {
  // Lógica de logout no Node não precisa de modificação no servidor.
  res.status(200).json({ message: 'Logout efetuado com sucesso' });
});

// Rota para marcar questionário como completo
router.post('/completar-questionario', async (req, res) => {
  try {
    const { uid } = req.body;
    const userRef = db.collection('usuarios').doc(uid);
    await userRef.update({ questionarioCompleto: true });
    res.status(200).json({ message: 'Questionário marcado como completo' });
  } catch (error) {
    console.error('Erro ao marcar questionário como completo:', error);
    res.status(500).json({ message: 'Erro ao atualizar questionário' });
  }
});

router.post('/enviar-questionario', async (req, res) => {
  const {
    userId,
    email,
    displayName,
    nomeCompletoUsuario,
    CPFUsuario,
    dataNascimentoUsuario,
    tipoConta,
    listaExperiencias,
    listaConhecimentos,
  } = req.body;

  try {
    const usuarioRef = db.collection('usuarios').doc(userId);

    // Atualiza ou cria o documento com os dados iniciais
    await usuarioRef.set({
      email,
      displayName,
      questionarioCompleto: true,
      nomeCompletoUsuario,
      CPFUsuario,
      dataNascimentoUsuario,
      tipoConta,
    });

    // Verifica se listaExperiencias e listaConhecimentos são arrays antes de usá-los
    if (Array.isArray(listaExperiencias)) {
      await usuarioRef.update({
        experienciasUsuario: admin.firestore.FieldValue.arrayUnion(...listaExperiencias),
      });
    } else {
      console.log("listaExperiencias não é um array válido.");
    }

    if (Array.isArray(listaConhecimentos)) {
      await usuarioRef.update({
        conhecimentoUsuario: admin.firestore.FieldValue.arrayUnion(...listaConhecimentos),
      });
    } else {
      console.log("listaConhecimentos não é um array válido.");
    }

    res.status(200).send({ message: 'Questionário enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar questionário:', error);
    res.status(500).send({ error: 'Erro ao enviar questionário' });
  }
});

router.put('/editar-usuario', async (req, res) => {
  try {
    const { uid, nomeCompleto, CPF, dataNascimento, tipoConta, experiencias, conhecimentos } = req.body;

    // Validação básica dos dados
    if (!uid || !nomeCompleto || !CPF) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    // Código para atualizar os dados no banco de dados
    // Exemplo para Firebase Firestore:
    const userRef = db.collection('usuarios').doc(uid);
    await userRef.update({
      nomeCompleto,
      CPF,
      dataNascimento,
      tipoConta,
      experiencias,
      conhecimentos
    });

    res.status(200).json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar o usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



module.exports = router;