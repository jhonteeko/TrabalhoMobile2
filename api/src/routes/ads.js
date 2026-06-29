const express = require('express')
const { PrismaClient } = require('../../generated/prisma')
const router = express.Router()

const prisma = new PrismaClient()

// POST /ads
router.post('/', async (req, res) => {
  try {
    const { title, description, price, tag, photo, sellerId } = req.body

    console.log('[Create Ad] Body recebido:', { title, description, price, tag, sellerId, photoLength: photo?.length })

    if (!title || !description || !price || !tag || !sellerId) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    const newAd = await prisma.ad.create({
      data: {
        title,
        description,
        price,
        tag,
        photo: photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQMuowloNOhI2zc4H-Hs8cP5yPACmgnfYwn1GWNdZ3zg&s=10',
        sellerId: parseInt(sellerId),
      },
      include: { seller: { select: { name: true } } }
    })

    console.log('[Create Ad] Anúncio criado com id:', newAd.id)

    res.status(201).json({
      id: newAd.id,
      title: newAd.title,
      description: newAd.description,
      price: newAd.price,
      tag: newAd.tag,
      photo: newAd.photo,
      seller: newAd.seller.name
    })
  } catch (error) {
    console.error('[Create Ad Error]', error)
    res.status(500).json({ error: 'Erro ao criar anúncio: ' + error.message })
  }
})

// GET /ads
router.get('/', async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { name: true } } }
    })

    res.json(ads.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      tag: ad.tag,
      photo: ad.photo,
      seller: ad.seller.name
    })))
  } catch (error) {
    console.error('[Get Ads Error]', error)
    res.status(500).json({ error: 'Erro ao buscar anúncios: ' + error.message })
  }
})

// Monta as rotas de comentários aninhadas: /ads/:adId/comments
const commentsRouter = require('./comments')
router.use('/:adId/comments', commentsRouter)

module.exports = router