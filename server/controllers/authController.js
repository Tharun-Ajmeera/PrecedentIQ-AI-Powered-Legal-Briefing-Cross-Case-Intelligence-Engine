// server/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';
import { logAudit } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'precedentiq_super_secure_jwt_secret_key_law_firm_2026_enterprise';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

function setTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    path: '/',
  });
}

export async function register(req, res, next) {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { firmName, fullName, email, password, role } = validatedData;

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email address is already registered.' });
    }

    // Create Firm
    const firmResult = await query(
      'INSERT INTO firms (name) VALUES ($1) RETURNING id, name, created_at',
      [firmName]
    );
    const firm = firmResult.rows[0];

    // Hash password with minimum 12 salt rounds
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create User
    const userResult = await query(
      `INSERT INTO users (firm_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, firm_id, email, full_name, role, created_at`,
      [firm.id, email.toLowerCase(), passwordHash, fullName, role]
    );
    const user = userResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        firm_id: user.firm_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setTokenCookie(res, token);

    // Record Audit
    await logAudit({
      firmId: user.firm_id,
      userId: user.id,
      action: 'USER_REGISTERED',
      metadata: { email: user.email, role: user.role, firmName: firm.name },
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        firmId: user.firm_id,
        firmName: firm.name,
      },
      token, // Also provided for clients that need bearer header support
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const userResult = await query(
      `SELECT u.id, u.firm_id, u.email, u.password_hash, u.full_name, u.role, f.name as firm_name
       FROM users u
       JOIN firms f ON f.id = u.firm_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        firm_id: user.firm_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setTokenCookie(res, token);

    await logAudit({
      firmId: user.firm_id,
      userId: user.id,
      action: 'USER_LOGIN',
      metadata: { email: user.email, role: user.role },
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        firmId: user.firm_id,
        firmName: user.firm_name,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  return res.status(200).json({ message: 'Logged out successfully.' });
}

export async function getCurrentUser(req, res, next) {
  try {
    const userResult = await query(
      `SELECT u.id, u.firm_id, u.email, u.full_name, u.role, f.name as firm_name
       FROM users u
       JOIN firms f ON f.id = u.firm_id
       WHERE u.id = $1`,
      [req.user.id],
      req.firmId
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const u = userResult.rows[0];
    return res.status(200).json({
      user: {
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        firmId: u.firm_id,
        firmName: u.firm_name,
      },
    });
  } catch (err) {
    next(err);
  }
}
