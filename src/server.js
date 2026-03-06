import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connnectDB } from './db/connect.js';
import "./models/relations.js";

// Rutas nuevas
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);

await connnectDB();

// Seed automático de roles
const { Rol } = await import('./models/relations.js');
await Rol.findOrCreate({ where: { Id_rol: 1 }, defaults: { name: 'Admin' } });
await Rol.findOrCreate({ where: { Id_rol: 2 }, defaults: { name: 'Cliente' } });

const { PORT = 4000 } = process.env;
app.listen(PORT, () => console.log(`Servidor ejecutandose por: ${PORT}`));