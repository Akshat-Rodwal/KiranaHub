import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import config from '../config/env.js';
import { sendEmail } from '../config/emailConfig.js';
import { sendSms } from '../config/smsConfig.js';
import { getWelcomeEmailTemplate, getOtpEmailTemplate } from '../utils/emailTemplates.js';

const SALT_ROUNDS = 10;
const googleClient = config.googleClientId ? new OAuth2Client(config.googleClientId) : null;

const register = async ({ name, email, phone, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.replace(/^(?:\+91|91)/, '').trim();

  // Check duplicate email
  const existingEmail = await User.findOne({ email: normalizedEmail }).lean();
  if (existingEmail) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'An account with this email already exists'
    );
  }

  // Check duplicate phone
  const existingPhone = await User.findOne({ phone: normalizedPhone }).lean();
  if (existingPhone) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'An account with this phone number already exists'
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash,
    role: role || 'customer',
  });

  // Trigger customer welcome email non-blockingly in background
  sendEmail({
    to: user.email,
    subject: 'Welcome to KiranaHub! ⚡ Instant 10-Minute Grocery Delivery',
    html: getWelcomeEmailTemplate({ name: user.name, promoCode: 'FIRST50' }),
  }).catch((err) => {
    console.warn('[Welcome Email Notice] Background email notice:', err?.message);
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return {
    user: user.toSafeUser(),
    accessToken,
    refreshToken,
  };
};

const login = async ({ identifier, password }) => {
  const cleaned = identifier.trim();
  const isEmail = cleaned.includes('@');
  const normalizedPhone = cleaned.replace(/^(?:\+91|91)/, '').trim();

  const query = isEmail
    ? { email: cleaned.toLowerCase() }
    : {
        $or: [
          { email: cleaned.toLowerCase() },
          { phone: normalizedPhone },
          { phone: cleaned },
        ],
      };

  const user = await User.findOne(query).select('+passwordHash');
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account is deactivated. Please contact customer support.'
    );
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return {
    user: user.toSafeUser(),
    accessToken,
    refreshToken,
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!user.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account is deactivated. Please contact customer support.'
    );
  }
  return user.toSafeUser();
};

const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User no longer active');
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  return {
    user: user.toSafeUser(),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const googleAuth = async ({ credential }) => {
  if (!credential) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Google ID token credential is required');
  }

  let googlePayload = null;

  if (googleClient && config.googleClientId) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
      googlePayload = ticket.getPayload();
    } catch (err) {
      console.warn('[Google Auth] Token verification notice:', err.message);
      // Fallback decode for local/testing credentials
      googlePayload = jwt.decode(credential);
    }
  } else {
    // Development fallback when GOOGLE_CLIENT_ID is not yet configured in .env
    googlePayload = jwt.decode(credential);
  }

  if (!googlePayload || !googlePayload.email) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Invalid Google credential token. Could not extract authenticated email.'
    );
  }

  const { sub: googleId, email, name, picture } = googlePayload;
  const normalizedEmail = email.toLowerCase().trim();

  // Search existing user by googleId or email
  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }],
  });

  let isNewUser = false;

  if (user) {
    if (!user.isActive) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Your account has been deactivated. Please contact customer support.'
      );
    }

    let modified = false;
    if (!user.googleId) {
      user.googleId = googleId;
      if (user.authProvider === 'local') {
        user.authProvider = 'google';
      }
      modified = true;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
      modified = true;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      modified = true;
    }

    if (modified) {
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Auto-create new customer user via Google OAuth
    isNewUser = true;
    const newUserData = {
      name: name?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      googleId,
      avatar: picture || '',
      authProvider: 'google',
      role: 'customer',
      isActive: true,
      isVerified: true,
    };
    // Strictly omit phone so MongoDB sparse index is not polluted with null/empty values
    delete newUserData.phone;

    try {
      user = await User.create(newUserData);

      // Trigger customer welcome email in background
      sendEmail({
        to: user.email,
        subject: 'Welcome to KiranaHub! ⚡ Instant 10-Minute Grocery Delivery',
        html: getWelcomeEmailTemplate({ name: user.name, promoCode: 'FIRST50' }),
      }).catch((err) => {
        console.warn('[Welcome Email Notice] Background email notice:', err?.message);
      });
    } catch (err) {
      if (err.code === 11000) {
        // Fallback: If concurrent creation or duplicate key occurred, link existing user
        user = await User.findOne({ email: normalizedEmail });
        if (user) {
          if (!user.googleId) user.googleId = googleId;
          if (picture && !user.avatar) user.avatar = picture;
          if (!user.isVerified) user.isVerified = true;
          await user.save({ validateBeforeSave: false });
          isNewUser = false;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return {
    user: user.toSafeUser(),
    accessToken,
    refreshToken,
    isNewUser,
  };
};

/**
 * Mask an email or phone identifier for safe user display
 */
const maskIdentifier = (identifier, channel) => {
  if (!identifier) return '';
  if (channel === 'email' || identifier.includes('@')) {
    const [name, domain] = identifier.split('@');
    const maskedName = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 3))}${name.slice(-1)}`;
    return `${maskedName}@${domain}`;
  }
  const clean = identifier.replace(/\D/g, '').slice(-10);
  return `+91 ${clean.slice(0, 2)}******${clean.slice(-2)}`;
};

/**
 * Send OTP for User Registration via Email or SMS
 */
const sendRegistrationOtp = async ({ name, email, phone, password, channel = 'sms' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // 1. Verify that email isn't already registered
  const existingEmailUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingEmailUser) {
    throw new ApiError(httpStatus.CONFLICT, 'An account with this email address already exists');
  }

  // 2. Verify that phone isn't already registered
  const existingPhoneUser = await User.findOne({ phone: cleanPhone }).lean();
  if (existingPhoneUser) {
    throw new ApiError(httpStatus.CONFLICT, 'An account with this mobile number already exists');
  }

  const targetIdentifier = channel === 'email' ? normalizedEmail : cleanPhone;

  // 3. Check 60s cooldown limit
  const existingOtp = await Otp.findOne({
    identifier: targetIdentifier,
    purpose: 'REGISTRATION',
  });

  if (existingOtp && existingOtp.lastSentAt) {
    const timeSinceLast = Date.now() - new Date(existingOtp.lastSentAt).getTime();
    if (timeSinceLast < 60000) {
      const waitSeconds = Math.ceil((60000 - timeSinceLast) / 1000);
      throw new ApiError(
        httpStatus.TOO_MANY_REQUESTS,
        `Please wait ${waitSeconds}s before requesting a new verification code`
      );
    }
  }

  // 4. Generate cryptographically random 6-digit numeric OTP
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(rawOtp, SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 5. Store/Update in Otp collection with 10-minute expiry
  await Otp.findOneAndUpdate(
    { identifier: targetIdentifier, purpose: 'REGISTRATION' },
    {
      identifier: targetIdentifier,
      channel,
      purpose: 'REGISTRATION',
      otpHash,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      metadata: {
        name: name.trim(),
        email: normalizedEmail,
        phone: cleanPhone,
        passwordHash,
        role: 'customer',
      },
    },
    { upsert: true, new: true }
  );

  // Fallback log inside OTP workflow so OTP is always accessible in Render console
  console.log('Generated OTP for', normalizedEmail || cleanPhone, ':', rawOtp);

  // 6. Non-blocking dispatch via chosen channel
  if (channel === 'email') {
    sendEmail({
      to: normalizedEmail,
      subject: `KiranaHub Verification Code: ${rawOtp}`,
      html: getOtpEmailTemplate({ otp: rawOtp, purpose: 'REGISTRATION', name: name.trim() }),
    }).catch((err) => {
      console.warn('[Registration Email OTP Error]:', err?.message);
    });
  } else {
    sendSms({
      to: cleanPhone,
      message: `KiranaHub: Your verification code is ${rawOtp}. Valid for 10 minutes. Do not share this code.`,
      otp: rawOtp,
    }).catch((err) => {
      console.warn('[Registration SMS OTP Error]:', err?.message);
    });
  }

  return {
    identifier: targetIdentifier,
    channel,
    maskedIdentifier: maskIdentifier(targetIdentifier, channel),
    cooldownSeconds: 60,
  };
};

/**
 * Verify Registration OTP and Create User Account
 */
const verifyRegistrationOtp = async ({ identifier, otp }) => {
  const cleanIdentifier = identifier.includes('@')
    ? identifier.toLowerCase().trim()
    : identifier.replace(/\D/g, '').slice(-10);

  const otpRecord = await Otp.findOne({
    identifier: cleanIdentifier,
    purpose: 'REGISTRATION',
  });

  if (!otpRecord || !otpRecord.expiresAt || new Date(otpRecord.expiresAt) < new Date()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Verification code has expired or is invalid. Please request a new code.'
    );
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      'Too many failed attempts. Please request a new verification code.'
    );
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = 5 - otpRecord.attempts;
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Incorrect verification code. ${remaining} attempt(s) remaining.`
    );
  }

  const { name, email, phone, passwordHash, role } = otpRecord.metadata || {};
  if (!email || !passwordHash) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Registration session data is missing. Please start over.');
  }

  // Double check if account was registered concurrently
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new ApiError(httpStatus.CONFLICT, 'An account with these details already exists.');
  }

  // Create verified user
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: role || 'customer',
    isVerified: true,
    authProvider: 'local',
  });

  // Purge verified OTP
  await Otp.deleteOne({ _id: otpRecord._id });

  // Non-blocking welcome email
  sendEmail({
    to: user.email,
    subject: 'Welcome to KiranaHub! ⚡ Instant 10-Minute Grocery Delivery',
    html: getWelcomeEmailTemplate({ name: user.name, promoCode: 'FIRST50' }),
  }).catch((err) => {
    console.warn('[Welcome Email Notice] Background email notice:', err?.message);
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return {
    user: user.toSafeUser(),
    accessToken,
    refreshToken,
  };
};

/**
 * Send OTP for Password Reset
 */
const sendForgotPasswordOtp = async ({ identifier, channel = 'sms' }) => {
  const cleaned = identifier.trim();
  const isEmail = cleaned.includes('@');
  const cleanPhone = cleaned.replace(/\D/g, '').slice(-10);

  const query = isEmail
    ? { email: cleaned.toLowerCase() }
    : { $or: [{ phone: cleanPhone }, { email: cleaned.toLowerCase() }] };

  const user = await User.findOne(query);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No registered account found with that email or mobile number.');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Your account is deactivated. Please contact support.');
  }

  // Select target based on user preference or availability
  const targetChannel = channel === 'email' ? 'email' : (user.phone ? 'sms' : 'email');
  const targetIdentifier = targetChannel === 'email' ? user.email : user.phone;

  // Check 60s cooldown
  const existingOtp = await Otp.findOne({
    identifier: targetIdentifier,
    purpose: 'FORGOT_PASSWORD',
  });

  if (existingOtp && existingOtp.lastSentAt) {
    const timeSinceLast = Date.now() - new Date(existingOtp.lastSentAt).getTime();
    if (timeSinceLast < 60000) {
      const waitSeconds = Math.ceil((60000 - timeSinceLast) / 1000);
      throw new ApiError(
        httpStatus.TOO_MANY_REQUESTS,
        `Please wait ${waitSeconds}s before requesting a new password reset code.`
      );
    }
  }

  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(rawOtp, SALT_ROUNDS);

  await Otp.findOneAndUpdate(
    { identifier: targetIdentifier, purpose: 'FORGOT_PASSWORD' },
    {
      identifier: targetIdentifier,
      channel: targetChannel,
      purpose: 'FORGOT_PASSWORD',
      otpHash,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      metadata: { userId: user._id },
      resetToken: null,
    },
    { upsert: true, new: true }
  );

  // Fallback log inside OTP workflow so OTP is always accessible in Render console
  console.log('Generated OTP for', user.email || targetIdentifier, ':', rawOtp);

  if (targetChannel === 'email') {
    sendEmail({
      to: user.email,
      subject: `KiranaHub Password Reset Code: ${rawOtp}`,
      html: getOtpEmailTemplate({ otp: rawOtp, purpose: 'FORGOT_PASSWORD', name: user.name }),
    }).catch((err) => {
      console.warn('[Forgot Password Email OTP Error]:', err?.message);
    });
  } else {
    sendSms({
      to: targetIdentifier,
      message: `KiranaHub: Your password reset code is ${rawOtp}. Valid for 10 minutes. Do not share this code.`,
      otp: rawOtp,
    }).catch((err) => {
      console.warn('[Forgot Password SMS OTP Error]:', err?.message);
    });
  }

  return {
    identifier: targetIdentifier,
    channel: targetChannel,
    maskedIdentifier: maskIdentifier(targetIdentifier, targetChannel),
    cooldownSeconds: 60,
  };
};

/**
 * Verify Forgot Password OTP and generate temporary resetToken
 */
const verifyForgotPasswordOtp = async ({ identifier, otp }) => {
  const cleanIdentifier = identifier.includes('@')
    ? identifier.toLowerCase().trim()
    : identifier.replace(/\D/g, '').slice(-10);

  const otpRecord = await Otp.findOne({
    identifier: cleanIdentifier,
    purpose: 'FORGOT_PASSWORD',
  });

  if (!otpRecord || !otpRecord.expiresAt || new Date(otpRecord.expiresAt) < new Date()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Password reset code has expired or is invalid. Please request a new code.'
    );
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      'Too many failed attempts. Please request a new password reset code.'
    );
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = 5 - otpRecord.attempts;
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Incorrect reset code. ${remaining} attempt(s) remaining.`
    );
  }

  // Generate secure 32-byte hexadecimal reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  otpRecord.resetToken = resetToken;
  otpRecord.otpHash = 'VERIFIED';
  otpRecord.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes to reset password
  await otpRecord.save();

  return {
    resetToken,
    message: 'Verification successful. You may now set your new password.',
  };
};

/**
 * Set New Password with verified resetToken
 */
const resetPassword = async ({ resetToken, newPassword }) => {
  const otpRecord = await Otp.findOne({
    resetToken,
    purpose: 'FORGOT_PASSWORD',
  });

  if (!otpRecord || !otpRecord.expiresAt || new Date(otpRecord.expiresAt) < new Date()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Password reset session has expired or is invalid. Please start over.'
    );
  }

  const userId = otpRecord.metadata?.userId;
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User account could not be found.');
  }

  // Update password
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  // Invalidate OTP/reset token record
  await Otp.deleteOne({ _id: otpRecord._id });

  return {
    success: true,
    message: 'Your password has been updated successfully. Please log in with your new credentials.',
  };
};

export {
  register,
  login,
  getMe,
  refreshToken,
  googleAuth,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};

export default {
  register,
  login,
  getMe,
  refreshToken,
  googleAuth,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};

