import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Uso: router.get('/profile', authMiddleware, getProfile)
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, rol }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

// Middleware de rol — uso: roleMiddleware(1) para solo admins
export const roleMiddleware = (requiredRol) => (req, res, next) => {
    if (!req.user || req.user.rol !== requiredRol) {
        return res.status(403).json({ message: "Acceso denegado." });
    }
    next();
};