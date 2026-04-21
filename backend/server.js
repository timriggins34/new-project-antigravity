const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { verifyToken, restrictIP } = require('./middleware/auth');
const prisma = require('./db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const clearanceRoutes = require('./routes/clearanceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const freightRoutes = require('./routes/freightRoutes');
const masterJobRoutes = require('./routes/masterJobRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const licenceRoutes = require('./routes/licenceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- BACKGROUND JOBS (CRON) ---

// Daily License Expiry Check (Midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily licence expiry check...');
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const licences = await prisma.licence.findMany({
      where: { alert: false }
    });

    let alertCount = 0;
    for (const licence of licences) {
      const expiryDate = new Date(licence.expiry);
      if (expiryDate <= thirtyDaysFromNow) {
        await prisma.licence.update({
          where: { id: licence.id },
          data: { alert: true }
        });
        alertCount++;
      }
    }
    console.log(`✅ Cron completed. Flagged ${alertCount} licences for expiry.`);
  } catch (error) {
    console.error('❌ Cron job failed:', error);
  }
});

// --- ROUTES ---

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes Middleware
app.use('/api', verifyToken, restrictIP);

// Protected Routes
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/master-jobs', masterJobRoutes);
app.use('/api/licences', licenceRoutes);

// Grouped/Mixed Path Routes (Mounted at /api directly to handle inconsistent paths)
app.use('/api', clearanceRoutes);
app.use('/api', documentRoutes);
app.use('/api', logisticsRoutes);
app.use('/api', freightRoutes);
app.use('/api', ruleRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Start Server and Run One-Shot Migration
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // DATA MIGRATION: Convert 'ANY' to null in DocumentRules
  try {
    const count = await prisma.documentRule.updateMany({
      where: {
        OR: [
          { direction: 'ANY' },
          { mode: 'ANY' },
          { incoterm: 'ANY' }
        ]
      },
      data: {
        direction: null,
        mode: null,
        incoterm: null
      }
    });
    
    const auditCount = await prisma.ruleAuditLog.updateMany({
       where: {
         OR: [
           { direction: 'ANY' },
           { mode: 'ANY' }
         ]
       },
       data: {
         direction: null,
         mode: null
       }
    });

    if (count.count > 0 || auditCount.count > 0) {
      console.log(`🧹 Migration: Sanitized ${count.count} Rules and ${auditCount.count} Audit Logs (converted 'ANY' to null).`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
});
