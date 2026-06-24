const express = require('express')
const prisma = require('../prisma') // Puxa o seu cliente Prisma global
const router = express.Router()

// 1. Rota para Salvar o Anúncio no Banco
router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, photo, sellerId } = req.body

    if (!title || !description || !price || !category || !sellerId) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    const newAd = await prisma.ad.create({
      data: {
        title,
        description,
        price,
        category,
        photo: photo || 'https://picsum.photos/seed/market/400/300',
        sellerId: parseInt(sellerId),
      },
      include: {
        seller: { select: { name: true } } // Já traz o nome do vendedor associado
      }
    })

    // Formata a resposta para bater com o padrão do Front-end
    res.status(201).json({
      id: newAd.id,
      title: newAd.title,
      description: newAd.description,
      price: newAd.price,
      category: newAd.category,
      photo: newAd.photo,
      seller: newAd.seller.name
    })
  } catch (error) {
    console.error('[Create Ad Error]', error)
    res.status(500).json({ error: 'Erro ao criar anúncio' })
  }
})

// 2. Rota para Buscar os Anúncios do Banco
router.get('/', async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
      include: {
        seller: { select: { name: true } }
      }
    })

    const formattedAds = ads.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      category: ad.category,
      photo: ad.photo,
      seller: ad.seller.name
    }))

    res.json(formattedAds)
  } catch (error) {
    console.error('[Get Ads Error]', error)
    res.status(500).json({ error: 'Erro ao buscar anúncios' })
  }
})

module.exports = router