import { DataTypes } from "sequelize";
import sequalize from "../db/connect.js";

export const Account = sequalize.define('Account', {
    Id_account: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true, // opcional para no romper cuentas existentes
    },
    subscriptionType: {
        type: DataTypes.ENUM('free', 'premium'),
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2), // Ej: 99999999.99
        defaultValue: 0.00,
        allowNull: false,
    },
    currency: {
        type: DataTypes.ENUM('USD', 'MXN', 'EUR', 'COP'),
        defaultValue: 'MXN',
        allowNull: false,
    },
    // FALTABA: FK hacia Users
    Id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'Id_user' }
    }
});