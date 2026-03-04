import { Rol } from "./Rol.js";
import { User } from "./User.js";
import { Account } from "./Account.js";
import { Saving } from "./Saving.js";
import { Transaction } from "./Transaction.js";


// Roles → Usuarios
Rol.hasMany(User, { foreignKey: "Id_rol" });
User.belongsTo(Rol, { foreignKey: "Id_rol" });

// Usuarios → Cuentas
User.hasMany(Account, { foreignKey: "Id_user" });
Account.belongsTo(User, { foreignKey: "Id_user" });

// Cuentas → Transacciones
Account.hasMany(Transaction, { foreignKey: "Id_account" });
Transaction.belongsTo(Account, { foreignKey: "Id_account" });

// Cuentas → Ahorros
Account.hasMany(Saving, { foreignKey: "Id_account" });
Saving.belongsTo(Account, { foreignKey: "Id_account" });

export { Rol, User, Account, Transaction, Saving };