const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(128),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;

