import apiClient from './apiClient.js';

/**
 * Authentication service communicating with backend KiranaHub auth endpoints.
 */
export const authService = {
  /**
   * Register a new user account
   * @param {Object} payload - { name, email, phone, password }
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async register(payload) {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Log in an existing user with email/phone and password
   * @param {Object} payload - { identifier, password }
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async login(payload) {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Log in or register with Google OAuth 2.0 credential token
   * @param {Object} payload - { credential }
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string, isNewUser?: boolean }>}
   */
  async googleLogin(payload) {
    const response = await apiClient.post('/auth/google', payload);
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile
   * @returns {Promise<{ user: Object }>}
   */
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Refresh JWT access token using refreshToken
   * @param {string} refreshToken
   * @returns {Promise<{ accessToken: string, refreshToken?: string }>}
   */
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  /**
   * Invalidate session / log out on the backend
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Backend logout errors shouldn't prevent local state cleanup
    }
  },

  /**
   * Send Registration OTP to Email or Phone
   * @param {Object} payload - { name, email, phone, password, channel }
   * @returns {Promise<{ identifier: string, channel: string, maskedIdentifier: string, cooldownSeconds: number }>}
   */
  async sendRegisterOtp(payload) {
    const response = await apiClient.post('/auth/register-otp', payload);
    return response.data;
  },

  /**
   * Verify Registration OTP and Complete Account Creation
   * @param {Object} payload - { identifier, otp }
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async verifyRegisterOtp(payload) {
    const response = await apiClient.post('/auth/verify-registration-otp', payload);
    return response.data;
  },

  /**
   * Send Password Reset OTP
   * @param {Object} payload - { identifier, channel }
   * @returns {Promise<{ identifier: string, channel: string, maskedIdentifier: string, cooldownSeconds: number }>}
   */
  async sendForgotPasswordOtp(payload) {
    const response = await apiClient.post('/auth/forgot-password-otp', payload);
    return response.data;
  },

  /**
   * Verify Password Reset OTP and obtain temporary resetToken
   * @param {Object} payload - { identifier, otp }
   * @returns {Promise<{ resetToken: string, message: string }>}
   */
  async verifyForgotPasswordOtp(payload) {
    const response = await apiClient.post('/auth/verify-forgot-password-otp', payload);
    return response.data;
  },

  /**
   * Set New Password with resetToken
   * @param {Object} payload - { resetToken, newPassword }
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async resetPassword(payload) {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },
};

export default authService;
