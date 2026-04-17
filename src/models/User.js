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
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
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
  Id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    references: { model: 'Rols', key: 'Id_rol' }
  },

  // ── Nuevos campos para reset de contraseña ──
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
});