import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/relations.js";
import { Rol } from "../models/relations.js";

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
            Id_rol: 2, // Cliente por defecto
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

        // Verificar email duplicado si lo cambia
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