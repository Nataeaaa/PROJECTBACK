import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './db/connect.js';

const app = express();

app.use(cors({
    origin:[
        "http://localhost:5173",
        process.env.FRONT_ORIGIN || "" 
    ].filter(Boolean),
    credentials: true
})
);

app.use(express.json());
app.use(morgan('dev'));

//Conectar a la base de datos
app.use(async (_req, _res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Error conectando a la base de datos', err);
        res.status(500).json({ error: 'Error conectando a la base de datos' });
    }
});

//Rutas
app.get("/", (_req, res) => res.json({ok:true, name: "Bienvenido a la API de Equalance"})); 
app.use('/api/auth', authRoutes);

export default app;