// server/middleware/auth.js
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. No valid session token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'precedentiq_super_secure_jwt_secret_key_law_firm_2026_enterprise';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    req.firmId = decoded.firm_id;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired session token. Please log in again.',
    });
  }
}
