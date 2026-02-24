const User = require('./User');
const Request = require('./Request');
const Tag = require('./Tag');


// Relacion 1 user N requests
User.hasMany(Request, { foreignKey: 'userId', onDelete: 'CASCADE' });
Request.belongsTo(User, { foreignKey: 'userId' });


// Relacion 1 request N tags
Request.hasMany(Tag, { foreignKey: 'requestId', onDelete: 'CASCADE' });
Tag.belongsTo(Request, { foreignKey: 'requestId' });




module.exports = {
    User,
    Request,
    Tag
};
