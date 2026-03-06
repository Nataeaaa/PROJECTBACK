import { Category } from "../models/relations.js";
import { Op } from "sequelize";

// ─────────────────────────────────────────────
// GET /categories
// Devuelve categorías globales (Id_user = null) + las del usuario
// ─────────────────────────────────────────────
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                [Op.or]: [
                    { Id_user: null },           // globales del sistema
                    { Id_user: req.user.id },    // personales del usuario
                ],
            },
            order: [["type", "ASC"], ["name", "ASC"]],
        });

        return res.status(200).json({ categories });
    } catch (error) {
        console.error("getCategories error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// GET /categories/:id
// ─────────────────────────────────────────────
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                Id_category: req.params.id,
                [Op.or]: [{ Id_user: null }, { Id_user: req.user.id }],
            },
        });

        if (!category) {
            return res.status(404).json({ message: "Categoría no encontrada." });
        }

        return res.status(200).json({ category });
    } catch (error) {
        console.error("getCategoryById error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// POST /categories  — crear categoría personalizada
// ─────────────────────────────────────────────
export const createCategory = async (req, res) => {
    try {
        const { name, icon, color, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: "name y type son requeridos." });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "type debe ser 'income' o 'expense'." });
        }

        const category = await Category.create({
            name,
            icon: icon || null,
            color: color || null,
            type,
            Id_user: req.user.id, // siempre asociada al usuario
        });

        return res.status(201).json({
            message: "Categoría creada correctamente.",
            category,
        });
    } catch (error) {
        console.error("createCategory error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// PUT /categories/:id  — solo categorías propias
// ─────────────────────────────────────────────
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                Id_category: req.params.id,
                Id_user: req.user.id, // no puede editar categorías globales
            },
        });

        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada o no tienes permiso para editarla.",
            });
        }

        const { name, icon, color, type } = req.body;

        if (type && !["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "type debe ser 'income' o 'expense'." });
        }

        await category.update({
            ...(name && { name }),
            ...(icon !== undefined && { icon }),
            ...(color !== undefined && { color }),
            ...(type && { type }),
        });

        return res.status(200).json({
            message: "Categoría actualizada.",
            category,
        });
    } catch (error) {
        console.error("updateCategory error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// DELETE /categories/:id  — solo categorías propias
// ─────────────────────────────────────────────
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                Id_category: req.params.id,
                Id_user: req.user.id, // no puede borrar categorías globales
            },
        });

        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada o no tienes permiso para eliminarla.",
            });
        }

        await category.destroy();

        return res.status(200).json({ message: "Categoría eliminada correctamente." });
    } catch (error) {
        console.error("deleteCategory error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};