import { Sequelize } from "sequelize";
import 'mysql2';

const { DB_NAME, DB_USER, DB_PASS, DB_HOST } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 2,        // serverless necesita pool pequeño
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 10000,
    },
    dialectOptions: {
        connectTimeout: 30000,
    },
});

export default sequelize;

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado a mysql');
        await sequelize.sync();
        console.log('Modelos sincronizados');
    } catch (err) {
        console.error('Error conectando a mysql', err);
        throw err; // ← lanza el error en lugar de process.exit(1)
    }
};