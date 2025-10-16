const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  consultation_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'notes',
  timestamps: true
});

module.exports = Note;

