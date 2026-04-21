const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- LICENCES ---
router.get('/', async (req, res) => {
  try { 
    const licences = await prisma.licence.findMany(); 
    res.json(licences); 
  } catch (error) { 
    res.status(500).json({ error: 'Failed to fetch licences' }); 
  }
});

// Licence Utilization Update
router.patch('/:id/utilize', async (req, res) => {
  try {
    const { amount } = req.body;
    const licence = await prisma.licence.findUnique({
      where: { licence_id: req.params.id }
    });

    if (!licence) return res.status(404).json({ error: 'Licence not found' });

    const updated = await prisma.licence.update({
      where: { licence_id: req.params.id },
      data: { utilized: (licence.utilized || 0) + amount }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update licence utilization' });
  }
});

module.exports = router;
