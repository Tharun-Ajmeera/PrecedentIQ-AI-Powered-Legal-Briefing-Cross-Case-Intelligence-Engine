// server/middleware/rbac.js

/**
 * Enforce role-based access control on routes
 * @param  {...string} allowedRoles - e.g. 'attorney', 'paralegal', 'compliance_officer'
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' lacks permission for this action. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}
