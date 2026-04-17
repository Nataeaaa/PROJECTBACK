import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/relations.js";
import { Rol } from "../models/relations.js";

import crypto from "crypto";
import nodemailer from "nodemailer";
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ─────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { name, lastName, email, password } = req.body;

        if (!name || !lastName || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "El email ya está registrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            lastName,
            email,
            password: hashedPassword,
            Id_rol: 2,
        });

        const token = jwt.sign(
            { id: user.Id_user, email: user.email, rol: user.Id_rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        return res.status(201).json({
            message: "Usuario registrado correctamente.",
            token,
            user: {
                id: user.Id_user,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("register error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son requeridos." });
        }

        const user = await User.findOne({
            where: { email },
            include: [{ model: Rol, attributes: ["name"] }],
        });

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        const token = jwt.sign(
            { id: user.Id_user, email: user.email, rol: user.Id_rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        return res.status(200).json({
            message: "Login exitoso.",
            token,
            user: {
                id: user.Id_user,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                rol: user.Rol?.name,
            },
        });
    } catch (error) {
        console.error("login error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// GET /auth/profile  (requiere middleware JWT)
// ─────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
            include: [{ model: Rol, attributes: ["name"] }],
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("getProfile error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// PUT /auth/profile  (requiere middleware JWT)
// ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { name, lastName, email } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(409).json({ message: "El email ya está en uso." });
            }
        }

        await user.update({ name, lastName, email });

        return res.status(200).json({
            message: "Perfil actualizado.",
            user: {
                id: user.Id_user,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("updateProfile error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// PUT /auth/change-password  (requiere middleware JWT)
// ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Ambas contraseñas son requeridas." });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "La contraseña actual es incorrecta." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        return res.status(200).json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("changePassword error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// POST /auth/forgot-password  (público)
// Body: { email }
// ─────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "El email es requerido." });
        }

        const user = await User.findOne({ where: { email } });

        // Respuesta genérica para no revelar si el email existe o no
        if (!user) {
            return res.status(200).json({
                message: "Si el email existe, recibirás un enlace de recuperación.",
            });
        }

        // Generar token seguro y fecha de expiración (1 hora)
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 60);

        await user.update({
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Equalance" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: "Recupera tu contraseña — Equalance",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
                    <h2 style="color:#6c63ff">Recuperación de contraseña</h2>
                    <p>Hola <strong>${user.name}</strong>,</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña.
                       Haz clic en el botón — el enlace expira en <strong>1 hora</strong>.</p>
                    <a href="${resetUrl}"
                       style="display:inline-block;margin:16px 0;padding:12px 28px;
                              background:#6c63ff;color:#fff;border-radius:8px;
                              text-decoration:none;font-weight:bold">
                        Restablecer contraseña
                    </a>
                    <p style="color:#888;font-size:12px">
                        Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
                    </p>
                </div>
            `,
        });

        return res.status(200).json({
            message: "Si el email existe, recibirás un enlace de recuperación.",
        });
    } catch (error) {
        console.error("forgotPassword error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ─────────────────────────────────────────────
// POST /auth/reset-password  (público)
// Body: { token, newPassword }
// ─────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token y nueva contraseña son requeridos." });
        }

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() }, // token aún vigente
            },
        });

        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return res.status(200).json({ message: "Contraseña restablecida correctamente." });
    } catch (error) {
        console.error("resetPassword error:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};