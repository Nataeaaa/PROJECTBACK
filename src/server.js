//carga las variables de entorno
import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connnectDB } from './db/connect.js';
import "./models/relations.js";

//import accountRoutes from './routes/accountRoutes.js';
//import savingRoutes from './routes/savingRoutes.js';
//import transactionRoutes from './routes/transactionRoutes.js';
//import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//app.post('/test', (req, res) => {res.json({ ok: true });});
//app.get('/', (req, res) => res.json({ok: true, name: 'API de Equalance'}));
//app.use('/api/accounts', accountRoutes);
//app.use('/api/savings', savingRoutes);
//app.use('/api/transactions', transactionRoutes);
//app.use('/api/users', userRoutes);

await connnectDB();

const { PORT = 4000 } = process.env;
app.listen(PORT, () => console.log(`Servidor ejecutandose por: ${PORT}`));