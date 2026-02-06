const User = require('./User');
const Request = require('./Request');

// Relacion 1 user N requests
User.hasMany(Request, { foreignKey: 'userId', onDelete: 'CASCADE' });
Request.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    Request
};
