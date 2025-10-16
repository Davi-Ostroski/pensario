const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false, // Desabilita logs SQL no console
  define: {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    underscored: false, // Usa camelCase ao invés de snake_case
  }
});

module.exports = sequelize;

