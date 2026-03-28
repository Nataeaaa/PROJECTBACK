import Anthropic from "@anthropic-ai/sdk";
import { Account } from "../models/relations.js";
import { Transaction } from "../models/relations.js";
import { Category } from "../models/relations.js";
import { Op } from "sequelize";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Consejos de respaldo ───────────────────────
const FALLBACK_TIPS = [
    "Anota cada gasto, por pequeño que sea. Los pequeños gastos diarios pueden sumar más de lo que crees al final del mes.",
    "Usa la regla 50/30/20: destina el 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorro.",
    "Antes de comprar algo, espera 24 horas. Si al día siguiente aún lo necesitas, entonces cómpralo.",
    "Revisa tus suscripciones mensuales. Es fácil olvidar servicios que ya no usas pero sigues pagando.",
    "Cocinar en casa en lugar de comer fuera puede ahorrarte hasta un 70% en gastos de alimentación.",
    "Establece un fondo de emergencia equivalente a 3 meses de tus gastos básicos.",
    "Compara precios antes de comprar. Unos minutos de investigación pueden ahorrarte mucho dinero.",
    "Paga primero tus ahorros, como si fuera una factura mensual obligatoria.",
    "Evita usar tarjetas de crédito para compras que no puedas pagar al final del mes.",
    "Pequeños ahorros diarios se convierten en grandes cantidades con el tiempo. ¡Empieza hoy!",
];

function getRandomFallback() {
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
}

// ── GET /advice ────────────────────────────────
export const getDailyAdvice = async (req, res) => {
    try {
        // Obtener transacciones del mes actual
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const today = now.toISOString().split("T")[0];

        const transactions = await Transaction.findAll({
            where: {
                Id_account: { [Op.in]: accountIds },
                date: { [Op.between]: [firstDay, today] },
            },
            include: [{ model: Category, attributes: ["name", "type"] }],
        });

        // Construir resumen para Claude
        const expenses = transactions.filter(t => t.type === "expense");
        const income = transactions.filter(t => t.type === "income");

        const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
        const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);

        // Top categorías de gasto
        const byCategory = {};
        for (const t of expenses) {
            const catName = t.Category?.name || "Otro";
            byCategory[catName] = (byCategory[catName] || 0) + Number(t.amount);
        }
        const topCategories = Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`)
            .join(", ");

        // Llamar a Claude
        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 150,
            messages: [
                {
                    role: "user",
                    content: `Eres un asesor financiero amigable. 
El usuario lleva este mes:
- Ingresos: $${totalIncome.toFixed(2)}
- Gastos: $${totalExpense.toFixed(2)}
- Principales categorías de gasto: ${topCategories || "sin gastos registrados"}

Dame UN consejo financiero corto, práctico y personalizado basado en estos datos. 
Máximo 2 oraciones. En español. Sin saludos ni presentaciones, ve directo al consejo.`,
                },
            ],
        });

        const advice = message.content[0].type === "text"
            ? message.content[0].text
            : getRandomFallback();

        return res.status(200).json({ advice, source: "ai" });

    } catch (error) {
        console.error("getDailyAdvice error:", error.message);
        // Fallback si Claude falla
        return res.status(200).json({ advice: getRandomFallback(), source: "fallback" });
    }
};