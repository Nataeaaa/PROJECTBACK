import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const Rol = sequelize.define('Rol', {
    Id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
});