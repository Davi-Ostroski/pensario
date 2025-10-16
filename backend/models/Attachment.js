const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(256),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notes',
      key: 'id'
    }
  }
}, {
  tableName: 'attachments',
  timestamps: true
});

module.exports = Attachment;

