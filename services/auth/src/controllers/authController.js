import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { INTERNAL_SERVICE_KEY, JWT_SECRET } from '../config/env.js';
import { TryCatch } from '../middlewares/tryCatch.js';
import { oauth2Client } from '../config/googleConfig.js';
import axios from 'axios';
import crypto from 'crypto';

const allowedRoles = ['customer', 'rider', 'seller'];
const passwordRequirements = [
  {
    test: (password) => password.length >= 6,
    message: 'at least 6 characters',
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: 'one uppercase letter',
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: 'one lowercase letter',
  },
  {
    test: (password) => /\d/.test(password),
    message: 'one number',
  },
  {
    test: (password) => /[^A-Za-z0-9]/.test(password),
    message: 'one special character',
  },
];

const getPasswordErrors = (password) => {
  const value = String(password || '');
  return passwordRequirements
    .filter((requirement) => !requirement.test(value))
    .map((requirement) => requirement.message);
};

const buildPasswordMessage = (label, password) => {
  const errors = getPasswordErrors(password);
  if (!errors.length) return null;
  return `${label} must include ${errors.join(', ')}.`;
};

// Simple password hashing using Node's built-in crypto (no extra dependency).
// Stored format: scrypt$N$r$p$saltHex$hashHex
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 64
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_PARAMS.keyLen,
      { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
      (err, derived) => (err ? reject(err) : resolve(derived))
    );
  });

  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, storedHash) => {
  if (!storedHash) return false;

  const parts = String(storedHash).split('$');
  if (parts.length !== 6) return false;

  const [prefix, Nstr, rstr, pstr, saltHex, hashHex] = parts;
  if (prefix !== 'scrypt') return false;

  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(hashHex, 'hex');

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      storedKey.length,
      { N: Number(Nstr), r: Number(rstr), p: Number(pstr) },
      (err, derived) => (err ? reject(err) : resolve(derived))
    );
  });

  if (derivedKey.length !== storedKey.length) return false;
  return crypto.timingSafeEqual(derivedKey, storedKey);
};

const buildUserResponse = (user) => ({
  _id: user._id,
  email: user.email,
  name: user.name,
  image: user.image,
  role: user.role
});

const escapeRegExp = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Case-insensitive email lookup to prevent duplicates from casing differences.
const findUserByEmail = async (normalizedEmail) => {
  const exact = await User.findOne({ email: normalizedEmail });
  if (exact) return exact;
  return User.findOne({ email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' } });
};
// Email/Password Authentication
export const emailSignup = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedPassword = String(password || '');

    if (!normalizedEmail || !normalizedPassword || !normalizedName) {
      return res.status(400).json({ success: false, message: 'Email, name, and password are required' });
    }
    const passwordMessage = buildPasswordMessage('Password', normalizedPassword);
    if (passwordMessage) {
      return res.status(400).json({ success: false, message: passwordMessage });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) user = await findUserByEmail(normalizedEmail);

    // Conflict-free email+Google linking:
    // - If Google created the user earlier (password is null), upgrade that record by hashing & saving password.
    // - If password already exists, treat this as a duplicate signup.
    if (user) {
      if (user.password) {
        return res.status(409).json({ success: false, message: 'Account already exists. Please log in.' });
      }

      user.password = await hashPassword(normalizedPassword);
      user.name = normalizedName || user.name;
      await user.save();
    } else {
      user = await User.create({
        email: normalizedEmail,
        name: normalizedName,
        password: await hashPassword(normalizedPassword),
        role: null
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: user.password ? 'Signed up successfully' : 'Signed up successfully',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      // Race between requests (unique email). Re-fetch and try the upgrade path once.
      const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
      const user = await findUserByEmail(normalizedEmail);
      if (user && !user.password) {
        user.password = await hashPassword(String(req.body?.password || ''));
        user.name = String(req.body?.name || '').trim() || user.name;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
          success: true,
          message: 'Signed up successfully',
          token,
          user: buildUserResponse(user)
        });
      }
    }

    return res.status(500).json({ success: false, message: error?.message || 'Internal Server Error' });
  }
}

export const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user exists but has no password, they must have signed up via Google.
    if (!user.password) {
      return res.status(400).json({ success: false,  messages: ["Google account found","Use Google to sign in"] });
    }

    const isValid = await verifyPassword(normalizedPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || 'Internal Server Error' });
  }
}

// Google OAuth
export const googleAuth = TryCatch(async (req, res) => {

  // Get user data from Google
  // Check if user exists
  // If not exist: Create new user with password: null
  // If exists: Merge (add password if they later set one)
  // Generate JWT token


  const { code } = req.body;

  if (!code) {
    return res.status(401).json({
      success: false,
      message: 'Authorization code required'
    })
  }

  const googleRes = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);

  const { email, name, picture } = userRes.data;

  const normalizedEmail = String(email || '').trim().toLowerCase();

  let user = await findUserByEmail(normalizedEmail);
  if (!user) {
    try {
      user = await User.create({
        email: normalizedEmail,
        name: String(name || '').trim() || 'User',
        image: picture
      });
    } catch (error) {
      // Race with emailSignup; unique email will reject one side.
      user = await findUserByEmail(normalizedEmail);
    }
  } else {
    // Do not touch password. Only merge basic profile fields.
    const update = {};
    if (name && String(name).trim() && String(name).trim() !== user.name) update.name = String(name).trim();
    if (picture && picture !== user.image) update.image = picture;

    if (Object.keys(update).length) {
      user = await User.findByIdAndUpdate(user._id, update, { returnDocument: 'after' });
    }
  }

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });
  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role
    }
  });
})

// Optional: Set password for existing Google user
export const setPassword = async (req, res) => {
  try {
    const { newPassword, currentPassword } = req.body || {};
    const normalizedNewPassword = String(newPassword || '');
    const normalizedCurrentPassword = currentPassword === undefined || currentPassword === null ? null : String(currentPassword);

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!normalizedNewPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }
    const passwordMessage = buildPasswordMessage('New password', normalizedNewPassword);
    if (passwordMessage) {
      return res.status(400).json({ success: false, message: passwordMessage });
    }

    // We need password field for validation/update.
    const user = await User.findById(req.user._id).select('password role email name image');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If the account already has a password, require currentPassword to avoid unauthorized password changes.
    if (user.password) {
      if (!normalizedCurrentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change it.' });
      }

      const isValidCurrent = await verifyPassword(normalizedCurrentPassword, user.password);
      if (!isValidCurrent) {
        return res.status(403).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.password = await hashPassword(normalizedNewPassword);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || 'Internal Server Error' });
  }
}

// allowing role
export const addUserRole = TryCatch(async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  const role = String(req.body.role || '').trim().toLowerCase();

  if (!allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid role'
    });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { returnDocument: 'after' }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({ success: true, user, token });
})

// show my profile
export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
})

// Update UserName through Rider Side
export const updateUser = TryCatch(async (req, res) => {

  const key = req.headers['x-internal-key'];

  if (key !== INTERNAL_SERVICE_KEY) return res.status(403).json({ message: 'Unauthorized service' });

  const { userId, name } = req.body;

  const user = await User.findByIdAndUpdate(userId, { name }, { returnDocument: 'after' });

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.status(200).json({ message: 'User updated', user });
});

// get user by id's for Admin
export const getUsersByIds = TryCatch(async (req, res) => {

  const key = req.headers['x-internal-key'];

  if (key !== INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: 'Unauthorized service' });
  }

  const ids = (req.query.ids || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!ids.length) {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await User.find({ _id: { $in: ids } }).select('name email role image');

  res.status(200).json({
    success: true,
    users,
  });
});
