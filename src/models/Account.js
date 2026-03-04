import { DataTypes } from "sequelize";
import sequalize from "../db/connect.js";

export const Account = sequalize.define('Account', {
    Id_account: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subscriptionType: {
        type: DataTypes.ENUM('free', 'premium'),
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
    },
    saving: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },

});