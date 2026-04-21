const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- USERS & ASSIGNMENT ---
router.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, username: true }
    });
    res.json(employees);
  } catch (error) { 
    res.status(500).json({ error: 'Failed to fetch employees' }); 
  }
});

module.exports = router;
