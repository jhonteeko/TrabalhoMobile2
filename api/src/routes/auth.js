const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = require('../prisma')

const router = express.Router()

const JWT_SECRET = 'show_de_bola'

router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body

    const userExists = await prisma.user.findUnique({
      where: {
        name
      }
    })

    if (userExists) {
      return res.status(400).json({
        error: 'este nome de usuário já está em uso'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword
      }
    })

    res.json({
      id: user.id,
      name: user.name
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: 'Erro no servidor'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body

    const user = await prisma.user.findUnique({
      where: {
        name
      }
    })

    if (!user) {
      return res.status(400).json({
        error: 'Usuário não encontrado'
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return res.status(400).json({
        error: 'Senha inválida'
      })
    }

    const token = jwt.sign(
      {
        id: user.id
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.json({
      token
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: 'Erro no servidor'
    })
  }
})

module.exports = router