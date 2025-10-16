const express = require('express');
const { Note, RevisionHistory } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Criar nova nota
router.post('/', async (req, res) => {
  try {
    const { title, content, category, consultation_date } = req.body;
    const user_id = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }

    const noteData = {
      user_id,
      title,
      content,
      category
    };

    if (consultation_date) {
      noteData.consultation_date = new Date(consultation_date);
    }

    const newNote = await Note.create(noteData);

    res.status(201).json({
      message: 'Nota criada com sucesso',
      note_id: newNote.id,
      note: newNote
    });

  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar todas as notas do usuário
router.get('/', async (req, res) => {
  try {
    const user_id = req.user.id;

    const notes = await Note.findAll({
      where: { user_id },
      order: [['createdAt', 'DESC']]
    });

    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      created_at: note.createdAt.toISOString(),
      consultation_date: note.consultation_date ? note.consultation_date.toISOString() : null,
      updated_at: note.updatedAt.toISOString()
    }));

    res.status(200).json({ notes: formattedNotes });

  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar nota específica
router.get('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const user_id = req.user.id;

    const note = await Note.findOne({
      where: { id: noteId, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    const formattedNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      created_at: note.createdAt.toISOString(),
      consultation_date: note.consultation_date ? note.consultation_date.toISOString() : null,
      updated_at: note.updatedAt.toISOString()
    };

    res.status(200).json({ note: formattedNote });

  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar nota
router.put('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const user_id = req.user.id;
    const { title, content, category, consultation_date } = req.body;

    const note = await Note.findOne({
      where: { id: noteId, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    const oldContent = note.content;

    // Atualizar dados da nota
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (consultation_date !== undefined) {
      updateData.consultation_date = consultation_date ? new Date(consultation_date) : null;
    }

    await note.update(updateData);

    // Registrar histórico de revisão se o conteúdo mudou
    if (content !== undefined && oldContent !== content) {
      await RevisionHistory.create({
        note_id: noteId,
        old_content: oldContent,
        new_content: content
      });
    }

    res.status(200).json({ message: 'Nota atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar nota
router.delete('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const user_id = req.user.id;

    const note = await Note.findOne({
      where: { id: noteId, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    await note.destroy();

    res.status(200).json({ message: 'Nota deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

