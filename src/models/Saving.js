import { DataTypes } from 'sequelize';
import sequelize from '../db/connect.js';

export const Saving = sequelize.define('Saving', {
    Id_saving: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    save_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM('active', 'completed', 'deleted'),
        allowNull: false,
    },
});