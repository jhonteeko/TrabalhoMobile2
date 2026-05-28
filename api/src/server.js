require('dotenv').config()

const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('API funcionando')
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor rodando')
})