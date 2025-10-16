const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./backend/models');

// Importar rotas
const authRoutes = require('./backend/routes/auth');
const notesRoutes = require('./backend/routes/notes');
const remindersRoutes = require('./backend/routes/reminders');
const attachmentsRoutes = require('./backend/routes/attachments');
const revisionsRoutes = require('./backend/routes/revisions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Habilitar CORS para todas as rotas
app.use(express.json()); // Parser para JSON
app.use(express.urlencoded({ extended: true })); // Parser para URL encoded

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Pensario Backend Node.js está funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      notes: '/notes',
      reminders: '/reminders',
      attachments: '/attachments',
      revisions: '/revisions'
    }
  });
});

// Rotas da API
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/reminders', remindersRoutes);
app.use('/attachments', attachmentsRoutes);
app.use('/revisions', revisionsRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Função para inicializar o servidor
async function startServer() {
  try {
    // Sincronizar banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Criar tabelas se não existirem
    await sequelize.sync({ force: false });
    console.log('Tabelas do banco de dados sincronizadas.');

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor
startServer();

module.exports = app;

