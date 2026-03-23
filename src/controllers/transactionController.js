import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { Op } from 'sequelize';

export const getTransactions = async (req, res) => {
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const transactions = await Transaction.findAll({ 
            where: { Id_account: { [Op.in]: accountIds } } 
        });
        return res.status(200).json({ transactions });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getTransactionById = async (req, res) => {
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const transaction = await Transaction.findOne({ 
            where: { 
                Id_transaction: req.params.id,
                Id_account: { [Op.in]: accountIds }
            } 
        });
        if (!transaction) return res.status(404).json({ message: "Transacción no encontrada." });
        return res.status(200).json({ transaction });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } 
};

export const createTransaction = async (req, res) => {
    try {
        const { type, name, amount, date, description, periodic, periodicFrequency, Id_category } = req.body;

        if (!type || !amount || !date || !Id_category) {
            return res.status(400).json({ message: "type, amount, date e Id_category son requeridos." });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: "type debe ser 'income' o 'expense'." });
        }

        const account = await Account.findOne({ 
            where: { Id_user: req.user.id, state: 'active' } 
        });
        if (!account) return res.status(404).json({ message: "Cuenta no encontrada." });

        // Si es gasto verifica saldo suficiente
        if (type === 'expense' && account.balance < amount) {
            return res.status(400).json({ message: "Saldo insuficiente." });
        }

        const newTransaction = await Transaction.create({
            type,
            name,
            amount,
            date,
            description: description || null,
            periodic: periodic || false,
            periodicFrequency: periodicFrequency || null,
            Id_category,
            Id_account: account.Id_account,
        });

        // Actualiza el balance según el tipo
        if (type === 'expense') {
            await account.update({ balance: Number(account.balance) - amount });
        } else {
            await account.update({ balance: Number(account.balance) + amount });
        }

        return res.status(201).json({ message: "Transacción creada exitosamente.", transaction: newTransaction });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }   
};

export const updateTransaction = async (req, res) => {
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const transaction = await Transaction.findOne({ 
            where: { 
                Id_transaction: req.params.id,
                Id_account: { [Op.in]: accountIds }
            } 
        });
        if (!transaction) return res.status(404).json({ message: "Transacción no encontrada." });

        const { name, amount, date, description, periodicFrequency, Id_category } = req.body;

        transaction.name = name || transaction.name;
        transaction.date = date || transaction.date;
        transaction.description = description || transaction.description;
        transaction.periodicFrequency = periodicFrequency || transaction.periodicFrequency;
        transaction.Id_category = Id_category || transaction.Id_category;

        // Si cambia el monto actualiza el balance
        if (amount && amount !== Number(transaction.amount)) {
            const account = await Account.findOne({ where: { Id_account: transaction.Id_account } });
            const diff = amount - Number(transaction.amount);

            if (transaction.type === 'expense') {
                if (account.balance < diff) {
                    return res.status(400).json({ message: "Saldo insuficiente." });
                }
                await account.update({ balance: Number(account.balance) - diff });
            } else {
                await account.update({ balance: Number(account.balance) + diff });
            }
            transaction.amount = amount;
        }

        await transaction.save();
        return res.status(200).json({ message: "Transacción actualizada.", transaction });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }   
};

export const deleteTransaction = async (req, res) => {  
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const transaction = await Transaction.findOne({ 
            where: { 
                Id_transaction: req.params.id,
                Id_account: { [Op.in]: accountIds }
            } 
        });
        if (!transaction) return res.status(404).json({ message: "Transacción no encontrada." });

        // Revierte el balance al eliminar
        const account = await Account.findOne({ where: { Id_account: transaction.Id_account } });
        if (transaction.type === 'expense') {
            await account.update({ balance: Number(account.balance) + Number(transaction.amount) });
        } else {
            await account.update({ balance: Number(account.balance) - Number(transaction.amount) });
        }

        await transaction.destroy();
        return res.status(200).json({ message: "Transacción eliminada exitosamente." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};