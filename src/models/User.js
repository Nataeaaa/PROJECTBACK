import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const User = sequelize.define('User', {
    Id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,  
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});