const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  remind_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notes',
      key: 'id'
    }
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
  tableName: 'reminders',
  timestamps: true
});

module.exports = Reminder;

