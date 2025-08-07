const { DataTypes } = require('sequelize');
const { sequelize } = require('../commands/utility/database');

const reminder = sequelize.define('reminder', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    remindAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

module.exports = { reminder };