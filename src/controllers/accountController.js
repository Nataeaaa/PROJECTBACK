import { Account } from "../models/relations.js";

// ─────────────────────────────────────────────
// GET /accounts  — todas las cuentas del usuario
// ─────────────────────────────────────────────
export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            where: { Id_user: req.user.id },
        });

        return res.status(200).json({ accounts });
    } catch (error) {
        console.error("getAccounts error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// GET /accounts/:id  — una cuenta por ID
// ─────────────────────────────────────────────
export const getAccountById = async (req, res) => {
    try {
        const account = await Account.findOne({
            where: { Id_account: req.params.id, Id_user: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: "Cuenta no encontrada." });
        }

        return res.status(200).json({ account });
    } catch (error) {
        console.error("getAccountById error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// POST /accounts  — crear nueva cuenta
// ─────────────────────────────────────────────
export const createAccount = async (req, res) => {
    try {
        const { subscriptionType, currency, balance } = req.body;

        if (!subscriptionType) {
            return res.status(400).json({ message: "subscriptionType es requerido." });
        }

        const account = await Account.create({
            subscriptionType,
            currency: currency || "MXN",
            balance: balance || 0.0,
            state: "active",
            Id_user: req.user.id,
        });

        return res.status(201).json({
            message: "Cuenta creada correctamente.",
            account,
        });
    } catch (error) {
        console.error("createAccount error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// PUT /accounts/:id  — actualizar cuenta
// ─────────────────────────────────────────────
export const updateAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            where: { Id_account: req.params.id, Id_user: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: "Cuenta no encontrada." });
        }

        const { subscriptionType, currency, state } = req.body;

        await account.update({
            ...(subscriptionType && { subscriptionType }),
            ...(currency && { currency }),
            ...(state && { state }),
        });

        return res.status(200).json({
            message: "Cuenta actualizada.",
            account,
        });
    } catch (error) {
        console.error("updateAccount error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// DELETE /accounts/:id  — desactivar cuenta (soft delete)
// ─────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            where: { Id_account: req.params.id, Id_user: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: "Cuenta no encontrada." });
        }

        // Soft delete: cambiar estado a inactive en lugar de eliminar
        await account.update({ state: "inactive" });

        return res.status(200).json({ message: "Cuenta desactivada correctamente." });
    } catch (error) {
        console.error("deleteAccount error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};