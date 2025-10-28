// authRouter.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../db.js';
import { CustomError } from '../utils/CustomError.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'E-mail já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      'INSERT INTO customers (first_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, first_name, email',
      [name, email, hashedPassword]
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await client.query('COMMIT');
    res.status(201).json({ user: { id: user.id, name: user.first_name, email: user.email }, token });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });

  try {
    const { rows } = await query('SELECT id, first_name, email, password_hash FROM customers WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Credenciais inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ user: { id: user.id, name: user.first_name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// Atualizar dados do usuário
router.put('/account/details', protect, async (req, res) => {
  const { name, email, phone } = req.body;
  const userId = req.userId; // Injetado pelo middleware 'protect'

  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
  }

  try {
    const { rows } = await query(
      `UPDATE customers 
       SET first_name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING id, first_name AS name, email, phone`,
      [name, email, phone, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar dados do usuário:', err);
    // Verifica erro de e-mail duplicado
    if (err.code === '23505') {
        return res.status(409).json({ message: 'Este e-mail já está em uso por outra conta.' });
    }
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// Alterar senha
router.put('/account/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Todos os campos de senha são obrigatórios' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    try {
        const { rows } = await query('SELECT password_hash FROM customers WHERE id = $1', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'A senha atual está incorreta' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await query('UPDATE customers SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Senha alterada com sucesso' });

    } catch (err) {
        console.error('Erro ao alterar senha:', err);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

export default router;
