const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    requestId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});



module.exports = Tag;
