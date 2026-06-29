const express = require('express')
const { PrismaClient } = require('../../generated/prisma')
const router = express.Router({ mergeParams: true }) // para acessar :adId

const prisma = new PrismaClient()

// GET /ads/:adId/comments — lista comentários de um anúncio
router.get('/', async (req, res) => {
  try {
    const adId = parseInt(req.params.adId)

    const comments = await prisma.comment.findMany({
      where: { adId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { name: true } }
      }
    })

    res.json(comments.map(c => ({
      id: c.id,
      content: c.content,
      author: c.author.name,
      createdAt: c.createdAt,
    })))
  } catch (error) {
    console.error('[Get Comments Error]', error)
    res.status(500).json({ error: 'Erro ao buscar comentários: ' + error.message })
  }
})

// POST /ads/:adId/comments — cria comentário
router.post('/', async (req, res) => {
  try {
    const adId    = parseInt(req.params.adId)
    const { content, authorId } = req.body

    if (!content || !authorId) {
      return res.status(400).json({ error: 'Conteúdo e authorId são obrigatórios' })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        adId,
        authorId: parseInt(authorId),
      },
      include: {
        author: { select: { name: true } }
      }
    })

    res.status(201).json({
      id: comment.id,
      content: comment.content,
      author: comment.author.name,
      createdAt: comment.createdAt,
    })
  } catch (error) {
    console.error('[Create Comment Error]', error)
    res.status(500).json({ error: 'Erro ao criar comentário: ' + error.message })
  }
})

module.exports = router