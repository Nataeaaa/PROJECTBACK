import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const Category = sequelize.define('Category', {
    Id_category: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    },
    
    // NULL = global del sistema | valor = categoría del usuario
    Id_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'Id_user' }
    }
});