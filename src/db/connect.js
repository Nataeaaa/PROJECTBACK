import { Sequelize } from "sequelize";

const {DB_NAME, DB_USER, DB_PASS, DB_HOST } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false, // Desactiva los logs de Sequelize
});

export default sequelize;

export const connnectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado a mysql');
        await sequelize.sync({ alter: true }); // crear o actualiza los automáticamente las tablas según los modelos definidos
        console.log('Modelos sincronizados con la base de datos');
    } catch (err) {
        console.error('Error conectado a mysql', err);
        process.exit(1);
    }
};