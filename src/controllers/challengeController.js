import { Challenge } from "../models/relations.js";
import { Transaction } from "../models/relations.js";
import { Account } from "../models/relations.js";
import { Category } from "../models/relations.js";
import { Op } from "sequelize";

// ── Helper: calcula progreso según tipo ───────
async function calculateProgress(challenge, userId) {
    const now   = new Date();
    const start = new Date(challenge.startDate);
    const end   = new Date(challenge.endDate);

    const totalDays  = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.min(
        Math.ceil((now - start) / (1000 * 60 * 60 * 24)),
        totalDays
    );
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    const accounts   = await Account.findAll({ where: { Id_user: userId } });
    const accountIds = accounts.map(a => a.Id_account);

    const transactions = await Transaction.findAll({
        where: {
            Id_account: { [Op.in]: accountIds },
            date: { [Op.between]: [challenge.startDate, challenge.endDate] },
        }
    });

    let current = 0;
    let target  = Number(challenge.targetAmount) || 0;
    let percent = 0;
    let description = "";

    if (challenge.type === "save_amount") {
        const income  = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
        const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
        current     = Math.max(0, income - expense);
        percent     = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        description = `Ahorrado: $${current.toFixed(2)} de $${target.toFixed(2)}`;

    } else if (challenge.type === "limit_category") {
        const spent = transactions
            .filter(t => t.type === "expense" && t.Id_category === challenge.Id_category)
            .reduce((s, t) => s + Number(t.amount), 0);
        current     = spent;
        percent     = target > 0 ? Math.min(Math.round((spent / target) * 100), 100) : 0;
        description = `Gastado: $${spent.toFixed(2)} de $${target.toFixed(2)} límite`;

    } else if (challenge.type === "spend_less") {
        const currentMonth = now.getMonth();
        const currentYear  = now.getFullYear();
        const prevMonth    = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear     = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentSpent = transactions
            .filter(t => {
                if (t.type !== "expense") return false;
                const d = new Date(t.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((s, t) => s + Number(t.amount), 0);

        const prevTransactions = await Transaction.findAll({
            where: {
                Id_account: { [Op.in]: accountIds },
                date: {
                    [Op.between]: [
                        `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-01`,
                        `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-31`,
                    ]
                },
                type: "expense",
            }
        });

        const prevSpent = prevTransactions.reduce((s, t) => s + Number(t.amount), 0);
        current     = currentSpent;
        target      = prevSpent;
        percent     = prevSpent > 0
            ? Math.max(0, Math.round(((prevSpent - currentSpent) / prevSpent) * 100))
            : 0;
        description = prevSpent > 0
            ? `Gastado: $${currentSpent.toFixed(2)} vs $${prevSpent.toFixed(2)} del mes pasado`
            : "Sin datos del mes anterior";
    }

    return { current, target, percent, description, daysPassed, totalDays, daysLeft };
}

// ─────────────────────────────────────────────
// GET /challenges
// ─────────────────────────────────────────────
export const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.findAll({
            where: { Id_user: req.user.id },
            include: [{ model: Category, attributes: ["name", "icon", "color"] }],
            order: [["createdAt", "DESC"]],
        });

        const withProgress = await Promise.all(
            challenges.map(async (c) => {
                const progress = await calculateProgress(c, req.user.id);
                return { ...c.toJSON(), progress };
            })
        );

        return res.status(200).json({ challenges: withProgress });
    } catch (error) {
        console.error("getChallenges error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// POST /challenges
// ─────────────────────────────────────────────
export const createChallenge = async (req, res) => {
    try {
        const { title, type, targetAmount, startDate, endDate, Id_category } = req.body;

        if (!title || !type || !startDate || !endDate) {
            return res.status(400).json({ message: "title, type, startDate y endDate son requeridos." });
        }

        if (!["save_amount", "limit_category", "spend_less"].includes(type)) {
            return res.status(400).json({ message: "Tipo de reto inválido." });
        }

        if (type === "limit_category" && !Id_category) {
            return res.status(400).json({ message: "Id_category es requerido para este tipo de reto." });
        }

        if (["save_amount", "limit_category"].includes(type) && !targetAmount) {
            return res.status(400).json({ message: "targetAmount es requerido para este tipo de reto." });
        }

        const challenge = await Challenge.create({
            title,
            type,
            targetAmount: targetAmount || null,
            startDate,
            endDate,
            state: "active",
            Id_user: req.user.id,
            Id_category: Id_category || null,
        });

        return res.status(201).json({ message: "Reto creado correctamente.", challenge });
    } catch (error) {
        console.error("createChallenge error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// DELETE /challenges/:id
// ─────────────────────────────────────────────
export const deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findOne({
            where: { Id_challenge: req.params.id, Id_user: req.user.id },
        });

        if (!challenge) {
            return res.status(404).json({ message: "Reto no encontrado." });
        }

        await challenge.destroy();
        return res.status(200).json({ message: "Reto eliminado correctamente." });
    } catch (error) {
        console.error("deleteChallenge error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};