const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevisionHistory = sequelize.define('RevisionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notes',
      key: 'id'
    }
  },
  old_content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  new_content: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'revision_histories',
  timestamps: true
});

module.exports = RevisionHistory;

