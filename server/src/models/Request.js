const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    prompt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    response: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

module.exports = Request;
