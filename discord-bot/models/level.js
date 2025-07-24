const { DataTypes } = require('sequelize');
const { sequelize } = require('../commands/utility/database');

const level = sequelize.define('level', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    xp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    rank: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Unranked',
    },
    nextRank: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Bronze Beggar',
    },
    nextXp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 300,
    },
});

module.exports = { level };