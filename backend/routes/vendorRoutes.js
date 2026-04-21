const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- VENDORS ---
router.get('/', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: { clearanceJobs: true, freightJobs: true, documents: true }
    });
    res.json(vendors);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch vendors' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        vendor_id: `VND-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      }
    });
    res.status(201).json(vendor);
  } catch (error) { res.status(500).json({ error: 'Failed to create vendor' }); }
});

module.exports = router;
