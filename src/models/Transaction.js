import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const Transaction = sequelize.define('Transaction', {
    Id_transaction: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(500), //Agregado, para notas del gasto
        allowNull: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    periodic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Podrías agregar un hook para validar esto
    periodicFrequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true,
        validate: {
            isValidWithPeriodic(value) {
                if (this.periodic && !value) {
                    throw new Error('periodicFrequency es requerido cuando periodic es true');
                }
            }
        }
    },

    //FKs
    Id_category: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'Id_category' }
    },
    Id_account: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Accounts', key: 'Id_account' }
    }
});