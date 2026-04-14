const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Default UPLOAD_DIR (absolute or relative to backend root)
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

/**
 * Ensures the target directory exists
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Mapping of internal entity types to folder names for better organization
 */
const entityFolderMap = {
  client: 'Clients',
  vendor: 'Vendors',
  clearanceJob: 'ClearanceJobs',
  logisticsTrip: 'LogisticsTrips'
};

/**
 * Multer disk storage configuration with dynamic folder logic
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Note: ensure entityType and entityId are appended to FormData BEFORE the file
    const { entityType, entityId } = req.body;
    
    const entityFolder = entityFolderMap[entityType] || 'General';
    const targetDir = path.join(UPLOAD_ROOT, entityFolder, entityId || 'Shared');
    
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Append timestamp to prevent overwriting same-named files
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const ext = path.extname(cleanName);
    const basename = path.basename(cleanName, ext);
    
    cb(null, `${basename}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = { upload, UPLOAD_ROOT };
