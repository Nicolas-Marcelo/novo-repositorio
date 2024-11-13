const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const colecaoDesafio = db.collection('desafios');
const colecaoSolucao = db.collection('solucao');

// ESTA MARAVILINDA ROTA PEGA TODOS OS DESAFIOS EXISTENTES
router.get('/', async (req, res) => {
  try {
    const desafiosRef = colecaoDesafio;
    const desafiosSnapshot = await desafiosRef.get();

    const desafios = await Promise.all(
      desafiosSnapshot.docs.map(async (doc) => {
        const desafioData = doc.data();

        // Buscar as soluções detalhadas com base nos IDs no array `solucoes`
        const solucoesDetalhadas = [];
        if (desafioData.solucoes && Array.isArray(desafioData.solucoes)) {
          for (const solucaoId of desafioData.solucoes) {
            const solucaoDoc = await db.collection('solucoes').doc(solucaoId).get();
            if (solucaoDoc.exists) {
              solucoesDetalhadas.push({ id: solucaoDoc.id, ...solucaoDoc.data() });
            }
          }
        }

        return {
          id: doc.id,
          ...desafioData,
          dataLimite: desafioData.dataLimite?.toDate ? desafioData.dataLimite.toDate() : null,
          solucoes: solucoesDetalhadas,
        };
      })
    );

    res.status(200).json(desafios);
  } catch (error) {
    console.error('Erro ao obter desafios:', error);
    res.status(500).json({ message: 'Erro ao obter desafios' });
  }
});

// JÁ ESTÁ PEGA APENAS O ID ESPEFIFICO PARA MOSTRAR OS DETALHES DO DESAFIO
router.get('/:id', async (req, res) => {
  try {
    const desafioId = req.params.id;
    const desafioDoc = await colecaoDesafio.doc(desafioId).get();

    if (!desafioDoc.exists) {
      return res.status(404).json({ message: 'Desafio não encontrado' });
    }

    const desafioData = desafioDoc.data();
    desafioData.dataLimite = desafioData.dataLimite?.toDate ? desafioData.dataLimite.toDate() : null;

    res.status(200).json({ id: desafioDoc.id, ...desafioData });
  } catch (error) {
    console.error('Erro ao obter detalhes do desafio:', error);
    res.status(500).json({ message: 'Erro ao obter detalhes do desafio' });
  }
});

// JÁ ESTÁ DELETA O NEGOCINHO LÁ PELO ID
router.delete('/:id', async (req, res) => {
  try {
    const desafioId = req.params.id;

    // Exclui o desafio
    await colecaoDesafio.doc(desafioId).delete();

    res.status(200).json({ message: 'Desafio excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir desafio:', error);
    res.status(500).json({ message: 'Erro ao excluir desafio' });
  }
});

// Rota para editar um desafio específico
router.put('/:id', async (req, res) => {
  const desafioId = req.params.id;  // Pega o ID do desafio da URL
  const { desafio, recompensa, dataLimite, descricao } = req.body; // Pega os dados que o usuário quer atualizar

  try {
    // Verifica se os dados foram passados corretamente
    if (!desafio || !recompensa || !dataLimite || !descricao) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Referência ao documento do desafio
    const desafioRef = colecaoDesafio.doc(desafioId);

    // Atualiza o documento com os novos dados
    await desafioRef.update({
      desafio,
      recompensa,
      dataLimite,
      descricao,
    });

    // Retorna uma resposta de sucesso
    res.status(200).json({ message: 'Desafio atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar desafio:', error);
    res.status(500).json({ error: 'Erro ao atualizar o desafio' });
  }
});



// Endpoint para adicionar uma solução a um desafio
router.post('/:id/solucoes', async (req, res) => {
  try {
    const desafioId = req.params.id;
    const { solucao } = req.body;

    if (!solucao) {no
      return res.status(400).json({ message: 'A solução é obrigatória' });
    }

    const desafioRef = colecaoDesafio.doc(desafioId);
    await desafioRef.update({
      solucoes: admin.firestore.FieldValue.arrayUnion(solucao),
    });

    res.status(200).json({ message: 'Solução adicionada com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar solução:', error);
    res.status(500).json({ message: 'Erro ao adicionar solução' });
  }
});

router.post('/adicionardesafios', async (req, res) => {
  try {
    const { desafio, recompensa, dataLimite, descricao, comunicacao, criterios, autorId } = req.body;

    if (!autorId || !desafio) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const novoDesafio = {
      desafio,
      recompensa,
      dataLimite: dataLimite ? new Date(dataLimite) : null,
      descricao,
      comunicacao,
      criterios: Array.isArray(criterios) ? criterios : [],
      autorId,
    };

    await db.collection('desafios').add(novoDesafio);

    res.status(200).json({ message: 'Desafio adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar desafio:', error);
    res.status(500).json({ message: 'Erro ao adicionar desafio' });
  }
});

module.exports = router;