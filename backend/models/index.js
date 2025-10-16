const sequelize = require('../config/database');
const User = require('./User');
const Note = require('./Note');
const Reminder = require('./Reminder');
const Attachment = require('./Attachment');
const RevisionHistory = require('./RevisionHistory');

// Definindo associações entre os modelos
User.hasMany(Note, { foreignKey: 'user_id', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

User.hasMany(Reminder, { foreignKey: 'user_id', as: 'reminders' });
Reminder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Note.hasMany(Reminder, { foreignKey: 'note_id', as: 'reminders' });
Reminder.belongsTo(Note, { foreignKey: 'note_id', as: 'note' });

Note.hasMany(Attachment, { foreignKey: 'note_id', as: 'attachments' });
Attachment.belongsTo(Note, { foreignKey: 'note_id', as: 'note' });

Note.hasMany(RevisionHistory, { foreignKey: 'note_id', as: 'revisions' });
RevisionHistory.belongsTo(Note, { foreignKey: 'note_id', as: 'note' });

module.exports = {
  sequelize,
  User,
  Note,
  Reminder,
  Attachment,
  RevisionHistory
};

