const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express')
const cors = require('cors')
const JWT_SECRET = process.env.JWT_SECRET

const authRoutes = require('./routes/auth')
const adsRoutes = require('./routes/ads')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/ads', adsRoutes)

app.get('/', (req, res) => {
  res.send('API funcionando')
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor rodando')
})