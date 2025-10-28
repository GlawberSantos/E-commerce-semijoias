// authRouter.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../db.js';
import { CustomError } from '../utils/CustomError.js';

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

export default router;
