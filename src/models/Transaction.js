import { DataTypes } from "sequelize";
import sequelize from "../db/connect.js";

export const Transaction = sequelize.define('Transaction', {
    Id_transaction: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    category: DataTypes.STRING,
    date: DataTypes.DATE,
    periodic: DataTypes.BOOLEAN,
});