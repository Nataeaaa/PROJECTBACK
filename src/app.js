import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db/connect.js';
import "./models/relations.js";

import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import savingRoutes from './routes/savingRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import adviceRoutes from './routes/adviceRoutes.js';

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.FRONT_ORIGIN || ""
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Conectar DB una sola vez (cached para serverless)
let dbConnected = false;
app.use(async (_req, _res, next) => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (err) {
            console.error('Error conectando a la base de datos', err);
            return _res.status(500).json({ error: 'Error conectando a la base de datos' });
        }
    }
    next();
});

app.get("/", (_req, res) => res.json({ ok: true, name: "Bienvenido a la API de Equalance" }));
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/advice', adviceRoutes);

export default app;