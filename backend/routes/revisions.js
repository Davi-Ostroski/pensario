const express = require('express');
const { RevisionHistory, Note } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Buscar histórico de revisões de uma nota
router.get('/note/:noteId', async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const user_id = req.user.id;

    // Verificar se a nota existe e pertence ao usuário
    const note = await Note.findOne({
      where: { id: noteId, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    const revisions = await RevisionHistory.findAll({
      where: { note_id: noteId },
      order: [['createdAt', 'DESC']]
    });

    const formattedRevisions = revisions.map(revision => ({
      id: revision.id,
      note_id: revision.note_id,
      old_content: revision.old_content,
      new_content: revision.new_content,
      revised_at: revision.createdAt.toISOString()
    }));

    res.status(200).json({ revisions: formattedRevisions });

  } catch (error) {
    console.error('Erro ao buscar histórico de revisões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar uma revisão específica
router.get('/:id', async (req, res) => {
  try {
    const revisionId = req.params.id;
    const user_id = req.user.id;

    const revision = await RevisionHistory.findOne({
      where: { id: revisionId },
      include: [{
        model: Note,
        as: 'note',
        where: { user_id }
      }]
    });

    if (!revision) {
      return res.status(404).json({ message: 'Revisão não encontrada' });
    }

    const formattedRevision = {
      id: revision.id,
      note_id: revision.note_id,
      old_content: revision.old_content,
      new_content: revision.new_content,
      revised_at: revision.createdAt.toISOString()
    };

    res.status(200).json({ revision: formattedRevision });

  } catch (error) {
    console.error('Erro ao buscar revisão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar uma revisão específica
router.delete('/:id', async (req, res) => {
  try {
    const revisionId = req.params.id;
    const user_id = req.user.id;

    const revision = await RevisionHistory.findOne({
      where: { id: revisionId },
      include: [{
        model: Note,
        as: 'note',
        where: { user_id }
      }]
    });

    if (!revision) {
      return res.status(404).json({ message: 'Revisão não encontrada' });
    }

    await revision.destroy();

    res.status(200).json({ message: 'Revisão deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar revisão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

