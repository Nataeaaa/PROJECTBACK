import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const Challenge = sequelize.define('Challenge', {
    Id_challenge: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('save_amount', 'limit_category', 'spend_less'),
        allowNull: false,
    },
    targetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // solo para save_amount y limit_category
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM('active', 'completed', 'failed'),
        defaultValue: 'active',
        allowNull: false,
    },
    // FK
    Id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'Id_user' }
    },
    Id_category: {
        type: DataTypes.INTEGER,
        allowNull: true, // solo para limit_category
        references: { model: 'Categories', key: 'Id_category' }
    },
});