const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username e password são obrigatórios' });
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Usuário já existe' });
    }

    // Hash da senha
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Criar novo usuário
    const newUser = await User.create({
      username,
      password_hash
    });

    res.status(201).json({ 
      message: 'Usuário registrado com sucesso',
      user_id: newUser.id,
      username: newUser.username
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username e password são obrigatórios' });
    }

    // Buscar usuário
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

