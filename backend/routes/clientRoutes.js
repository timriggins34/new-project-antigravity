const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- CLIENTS ---
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: { documents: true }
    });
    res.json(clients);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch clients' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newClient = await prisma.client.create({
      data: {
        ...data,
        client_id: `CLI-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        documents: data.documents ? { create: data.documents } : undefined
      },
      include: { documents: true }
    });
    res.status(201).json(newClient);
  } catch (error) { res.status(500).json({ error: 'Failed to create client' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { documents, ...rest } = req.body;
    const updated = await prisma.client.update({
      where: { client_id: req.params.id },
      data: rest,
      include: { documents: true }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update client' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({ where: { client_id: req.params.id } });
    if (client) {
      await prisma.document.deleteMany({ where: { clientId: client.id } });
      await prisma.client.delete({ where: { client_id: req.params.id } });
    }
    res.json({ message: 'Client and related records deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete client' }); }
});

module.exports = router;
