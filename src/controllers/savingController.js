import { Saving } from '../models/Saving.js';
import { Account } from '../models/Account.js';
import { Op } from 'sequelize';
import { Transaction } from '../models/Transaction.js';

export const getSavings = async (req, res) => {
    try {
        // Primero busca las cuentas del usuario
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        // Luego busca los ahorros de esas cuentas
        const savings = await Saving.findAll({ 
            where: { Id_account: { [Op.in]: accountIds } } 
        });
        return res.status(200).json({ savings });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getSavingById = async (req, res) => {
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const saving = await Saving.findOne({ 
            where: { 
                Id_saving: req.params.id, 
                Id_account: { [Op.in]: accountIds }
            } 
        });
        if (!saving) return res.status(404).json({ message: "Ahorro no encontrado." });
        return res.status(200).json({ saving });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const createSaving = async (req, res) => {
    try {
        const { save_name, amount, targetDate, goal, Id_account } = req.body;

        if (!save_name || !amount || !goal) {
            return res.status(400).json({ message: "Nombre, monto y objetivo son requeridos." });
        }

        // Busca la cuenta activa del usuario        
        const account = await Account.findOne({
            where: { Id_account, Id_user: req.user.id }
        });

        if (!account) {
            return res.status(404).json({ message: "Cuenta no encontrada." });
        }

        // Verifica que haya suficiente saldo
        if (account.balance < amount) {
            return res.status(400).json({ message: "Saldo insuficiente." });
        }

        // Crea el ahorro
        const newSaving = await Saving.create({
            save_name,
            amount: amount ?? 0,
            goal: goal ?? 0,
            targetDate: targetDate || null,
            state: "active",
            Id_account: account.Id_account,
        });

        await account.update({ balance: account.balance - amount });

        await Transaction.create({
            type: 'expense',
            name: `Ahorro: ${save_name}`,
            amount,
            date: new Date(),
            description: `Creación de ahorro con objetivo ${goal}`,
            periodic: false,
            Id_category: 1,
            Id_account: account.Id_account,
        });

        return res.status(201).json({ message: "Ahorro creado exitosamente.", saving: newSaving });
    } catch (error) {
        console.error("createSaving error:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const updateSaving = async (req, res) => {
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const saving = await Saving.findOne({ 
            where: { 
                Id_saving: req.params.id,
                Id_account: { [Op.in]: accountIds }
            } 
        });
        if (!saving) return res.status(404).json({ message: "Ahorro no encontrado." });

        const account = await Account.findOne({ where: { Id_account: saving.Id_account } });
        const { save_name, amount, targetDate, goal } = req.body;

        // Suma el monto al ahorro en lugar de reemplazarlo
        if (amount && amount > 0) {
            if (account.balance < amount) {
                return res.status(400).json({ message: "Saldo insuficiente." });
            }
            saving.amount = Number(saving.amount) + amount;
            await account.update({ balance: account.balance - amount });

            if (saving.amount >= Number(saving.goal)) {
                saving.state = 'completed';
            }

            await Transaction.create({
                type: 'expense',
                name: `Depósito a ahorro: ${saving.save_name}`,
                amount,
                date: new Date(),
                description: `Depósito a ahorro: ${saving.save_name} con objetivo ${saving.goal}`,
                periodic: false,
                Id_category: 1,
                Id_account: account.Id_account,
            });
        }

        saving.save_name = save_name || saving.save_name;
        saving.targetDate = targetDate || saving.targetDate;
        saving.goal = goal || saving.goal;

        await saving.save();
        return res.status(200).json({ message: "Ahorro actualizado.", saving });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteSaving = async (req, res) => {
    try {
        const accounts = await Account.findAll({ where: { Id_user: req.user.id } });
        const accountIds = accounts.map(a => a.Id_account);

        const saving = await Saving.findOne({ 
            where: { 
                Id_saving: req.params.id,
                Id_account: { [Op.in]: accountIds }
            } 
        });
        if (!saving) return res.status(404).json({ message: "Ahorro no encontrado." });

        const account = await Account.findOne({ where: { Id_account: saving.Id_account } });
        console.log('balance cuenta:', account.balance, typeof account.balance);
        console.log('amount ahorro:', saving.amount, typeof saving.amount);
        await account.update({ balance: Number(account.balance) + Number(saving.amount) });
        
        await Transaction.create({
            type: 'income',
            name: `Retiro de ahorro: ${saving.save_name}`,
            amount: Number(saving.amount),
            date: new Date(),
            description: `Retiro de ahorro: ${saving.save_name} con objetivo ${saving.goal}`,
            periodic: false,
            Id_category: 2,
            Id_account: account.Id_account,
        });

        await saving.destroy();
        return res.status(200).json({ message: "Ahorro eliminado exitosamente." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};