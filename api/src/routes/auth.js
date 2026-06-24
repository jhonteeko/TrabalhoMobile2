const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = require('../prisma')

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido no .env')
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body

    if (!name || !password) {
      return res.status(400).json({ error: 'Nome e senha são obrigatórios' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' })
    }

    const userExists = await prisma.user.findUnique({ where: { name } })

    if (userExists) {
      return res.status(400).json({ error: 'Este nome de usuário já está em uso' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, password: hashedPassword },
    })

    const token = generateToken(user.id)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('[register]', error)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body

    if (!name || !password) {
      return res.status(400).json({ error: 'Nome e senha são obrigatórios' })
    }

    const user = await prisma.user.findUnique({ where: { name } })

    if (!user) {
      return res.status(400).json({ error: 'Usuário ou senha inválidos' })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(400).json({ error: 'Usuário ou senha inválidos' })
    }

    const token = generateToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('[login]', error)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

module.exports = router