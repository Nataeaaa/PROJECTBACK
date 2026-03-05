import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const User = sequelize.define('User', {
    Id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,  // no tenía restricción
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,  // no tenía restricción
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,  
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // FALTABA: FK del diagrama (Usuarios → Roles)
    Id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2, // 1=Admin, 2=Cliente por defecto
    }
});