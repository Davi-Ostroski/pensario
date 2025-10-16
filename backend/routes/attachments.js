const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Attachment, Note } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas certos tipos de arquivo
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|mp4|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Upload de anexo
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { note_id } = req.body;
    const user_id = req.user.id;

    if (!note_id) {
      return res.status(400).json({ message: 'Note ID é obrigatório' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo é obrigatório' });
    }

    // Verificar se a nota existe e pertence ao usuário
    const note = await Note.findOne({
      where: { id: note_id, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    const newAttachment = await Attachment.create({
      note_id,
      filename: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype
    });

    res.status(201).json({
      message: 'Anexo enviado com sucesso',
      attachment_id: newAttachment.id,
      attachment: {
        id: newAttachment.id,
        filename: newAttachment.filename,
        file_type: newAttachment.file_type,
        uploaded_at: newAttachment.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao fazer upload do anexo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar anexo (apenas metadados - para compatibilidade com API original)
router.post('/', async (req, res) => {
  try {
    const { note_id, filename, file_path, file_type } = req.body;
    const user_id = req.user.id;

    if (!note_id || !filename || !file_path) {
      return res.status(400).json({ message: 'Note ID, filename e file_path são obrigatórios' });
    }

    // Verificar se a nota existe e pertence ao usuário
    const note = await Note.findOne({
      where: { id: note_id, user_id }
    });

    if (!note) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    const newAttachment = await Attachment.create({
      note_id,
      filename,
      file_path,
      file_type
    });

    res.status(201).json({
      message: 'Anexo criado com sucesso',
      attachment_id: newAttachment.id
    });

  } catch (error) {
    console.error('Erro ao criar anexo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar anexos de uma nota
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

    const attachments = await Attachment.findAll({
      where: { note_id: noteId },
      order: [['createdAt', 'DESC']]
    });

    const formattedAttachments = attachments.map(attachment => ({
      id: attachment.id,
      filename: attachment.filename,
      file_path: attachment.file_path,
      file_type: attachment.file_type,
      uploaded_at: attachment.createdAt.toISOString()
    }));

    res.status(200).json({ attachments: formattedAttachments });

  } catch (error) {
    console.error('Erro ao buscar anexos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Download de anexo
router.get('/download/:id', async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const user_id = req.user.id;

    const attachment = await Attachment.findOne({
      where: { id: attachmentId },
      include: [{
        model: Note,
        as: 'note',
        where: { user_id }
      }]
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    const filePath = attachment.file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado no servidor' });
    }

    res.download(filePath, attachment.filename);

  } catch (error) {
    console.error('Erro ao fazer download do anexo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar anexo
router.delete('/:id', async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const user_id = req.user.id;

    const attachment = await Attachment.findOne({
      where: { id: attachmentId },
      include: [{
        model: Note,
        as: 'note',
        where: { user_id }
      }]
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    // Deletar arquivo físico
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    // Deletar registro do banco
    await attachment.destroy();

    res.status(200).json({ message: 'Anexo deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar anexo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

