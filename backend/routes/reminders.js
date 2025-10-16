const express = require('express');
const { Reminder, Note } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Criar novo lembrete
router.post('/', async (req, res) => {
  try {
    const { note_id, remind_at } = req.body;
    const user_id = req.user.id;

    if (!note_id || !remind_at) {
      return res.status(400).json({ message: 'Note ID e remind_at são obrigatórios' });
    }

    // Verificar se a nota existe e pertence ao usuário
    const note = await Note.findOne({
      where: { id: note_id, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    const newReminder = await Reminder.create({
      user_id,
      note_id,
      remind_at: new Date(remind_at)
    });

    res.status(201).json({
      message: 'Lembrete criado com sucesso',
      reminder_id: newReminder.id,
      reminder: {
        id: newReminder.id,
        note_id: newReminder.note_id,
        remind_at: newReminder.remind_at.toISOString(),
        created_at: newReminder.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao criar lembrete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar todos os lembretes do usuário
router.get('/', async (req, res) => {
  try {
    const user_id = req.user.id;

    const reminders = await Reminder.findAll({
      where: { user_id },
      include: [{
        model: Note,
        as: 'note',
        attributes: ['id', 'title']
      }],
      order: [['remind_at', 'ASC']]
    });

    const formattedReminders = reminders.map(reminder => ({
      id: reminder.id,
      note_id: reminder.note_id,
      note_title: reminder.note ? reminder.note.title : null,
      remind_at: reminder.remind_at.toISOString(),
      created_at: reminder.createdAt.toISOString()
    }));

    res.status(200).json({ reminders: formattedReminders });

  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar lembretes de uma nota específica
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

    const reminders = await Reminder.findAll({
      where: { note_id: noteId, user_id },
      order: [['remind_at', 'ASC']]
    });

    const formattedReminders = reminders.map(reminder => ({
      id: reminder.id,
      note_id: reminder.note_id,
      remind_at: reminder.remind_at.toISOString(),
      created_at: reminder.createdAt.toISOString()
    }));

    res.status(200).json({ reminders: formattedReminders });

  } catch (error) {
    console.error('Erro ao buscar lembretes da nota:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar lembrete
router.put('/:id', async (req, res) => {
  try {
    const reminderId = req.params.id;
    const user_id = req.user.id;
    const { remind_at } = req.body;

    if (!remind_at) {
      return res.status(400).json({ message: 'remind_at é obrigatório' });
    }

    const reminder = await Reminder.findOne({
      where: { id: reminderId, user_id }
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Lembrete não encontrado' });
    }

    await reminder.update({
      remind_at: new Date(remind_at)
    });

    res.status(200).json({ message: 'Lembrete atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar lembrete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar lembrete
router.delete('/:id', async (req, res) => {
  try {
    const reminderId = req.params.id;
    const user_id = req.user.id;

    const reminder = await Reminder.findOne({
      where: { id: reminderId, user_id }
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Lembrete não encontrado' });
    }

    await reminder.destroy();

    res.status(200).json({ message: 'Lembrete deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar lembrete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

