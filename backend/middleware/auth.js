const jwt = require('jsonwebtoken');

/**
 * verifyToken - Checks for valid JWT in Authorization header
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * restrictIP - Simple IP-based restriction for intranet security
 */
const restrictIP = (req, res, next) => {
  const allowedIps = (process.env.ALLOWED_IPS || '').split(',').map(ip => ip.trim());
  const clientIp = req.ip;

  // Check for direct match or IPv6-mapped IPv4
  const isAllowed = allowedIps.some(allowedIp => 
    clientIp === allowedIp || 
    clientIp === `::ffff:${allowedIp}` ||
    (allowedIp === '::1' && clientIp === '127.0.0.1')
  );

  if (!isAllowed && allowedIps.length > 0) {
    console.warn(`[Security] Blocked unauthorized access attempt from IP: ${clientIp}`);
    return res.status(403).json({ error: 'Access denied: Unauthorized network location.' });
  }
  
  next();
};

module.exports = { verifyToken, restrictIP };
