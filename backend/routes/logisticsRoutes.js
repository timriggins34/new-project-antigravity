const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- LOGISTICS TRIPS ---
router.get('/logistics-trips', async (req, res) => {
  try {
    const trips = await prisma.logisticsTrip.findMany({
      include: {
        assignedTo: { select: { id: true, name: true } },
        documents: true
      }
    });
    res.json(trips);
  }
  catch (error) { res.status(500).json({ error: 'Failed to fetch trips' }); }
});

// Kanban Status Update
router.patch('/logistics/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.logisticsTrip.update({
      where: { trip_id: req.params.id },
      data: {
        status,
        delayed: false
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update logistics status' }); }
});

router.post('/logistics-trips', async (req, res) => {
  try {
    const { assignedToId, ...data } = req.body;
    const trip = await prisma.logisticsTrip.create({
      data: {
        ...data,
        assignedToId: assignedToId || null
      },
      include: { assignedTo: true }
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create logistics trip' });
  }
});

router.put('/logistics-trips/:id', async (req, res) => {
  try {
    const { assignedToId, ...data } = req.body;
    const updated = await prisma.logisticsTrip.update({
      where: { trip_id: req.params.id },
      data: {
        truck: data.truck,
        driver: data.driver,
        status: data.status,
        eta: data.eta,
        delayed: data.delayed,
        assignedToId: assignedToId || null
      },
      include: { assignedTo: true }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update logistics trip' }); }
});

module.exports = router;
