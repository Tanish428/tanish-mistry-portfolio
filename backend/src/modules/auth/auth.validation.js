const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates login request body
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      data: null,
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
      data: null,
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
      data: null,
    });
  }

  // Enforce bcrypt 72-byte limit to prevent silent truncation
  const passwordBytes = Buffer.byteLength(password, 'utf8');
  if (passwordBytes > 72) {
    return res.status(400).json({
      success: false,
      message: 'Password must not exceed 72 bytes in UTF-8 encoding',
      data: null,
    });
  }

  req.body.email = normalizedEmail;
  next();
};

/**
 * Validates administrator provisioning inputs
 */
export const validateProvisioningInput = ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Administrator name must be at least 2 characters',
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: 'Administrator name cannot exceed 100 characters',
    };
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    return {
      isValid: false,
      error: 'A valid email address is required',
    };
  }

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  if (password.length < 12) {
    return {
      isValid: false,
      error: 'Password must be at least 12 characters',
    };
  }

  const passwordBytes = Buffer.byteLength(password, 'utf8');
  if (passwordBytes > 72) {
    return {
      isValid: false,
      error: 'Password must not exceed 72 bytes in UTF-8 encoding',
    };
  }

  return { isValid: true, error: null };
};
