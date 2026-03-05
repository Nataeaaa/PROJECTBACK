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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    // ¿Para cuándo quiero ahorrar X cantidad?
    targetDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    state: {
        type: DataTypes.ENUM('active', 'completed', 'deleted'),
        allowNull: false,
    },
    //FKs
    Id_account: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Accounts', key: 'Id_account' }
    }
});