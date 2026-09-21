import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../store/useAuthStore.js';
import authService from '../../services/auth.service.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Container from '../../components/common/Container.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';
import { ROUTES } from '../../constants/index.js';
import { toast } from '../../components/common/Toast.jsx';
import {
  IconShoppingBag,
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconEye,
  IconEyeOff,
} from '../../utils/icons.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, setSession, isAuthenticated, clearError } = useAuthStore();

  // Step 1 = Form Details, Step 2 = OTP Verification
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    channel: 'sms', // 'sms' | 'email'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // OTP Verification state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [maskedTarget, setMaskedTarget] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const redirectPath = location.state?.from?.pathname || ROUTES.HOME;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Reactive 60-second countdown timer for Resend button
  useEffect(() => {
    let timer = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (formError) setFormError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSendingOtp(true);
    setFormError('');

    try {
      const response = await authService.sendRegisterOtp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        channel: formData.channel,
      });

      setMaskedTarget(response.maskedIdentifier);
      setCountdown(response.cooldownSeconds || 60);
      setCanResend(false);
      setOtp('');
      setOtpError('');
      setStep(2);

      toast.success(
        formData.channel === 'email'
          ? 'Verification code sent to your email!'
          : 'Verification code sent to your mobile number!'
      );
    } catch (err) {
      const msg = err?.message || 'Failed to dispatch verification code';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isSendingOtp) return;
    setIsSendingOtp(true);
    setOtpError('');

    try {
      const response = await authService.sendRegisterOtp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        channel: formData.channel,
      });

      setCountdown(response.cooldownSeconds || 60);
      setCanResend(false);
      setOtp('');
      toast.success(`A fresh 6-digit code was sent to ${response.maskedIdentifier}!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to resend code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (submittedOtp = otp) => {
    if (!submittedOtp || submittedOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    const identifier =
      formData.channel === 'email'
        ? formData.email.trim()
        : formData.phone.replace(/\D/g, '');

    try {
      const result = await authService.verifyRegisterOtp({
        identifier,
        otp: submittedOtp,
      });

      setSession(result.user, result.accessToken, result.refreshToken);

      toast.success(`Welcome to KiranaHub, ${result.user.name}!`, {
        description: 'Your account has been verified and created successfully.',
      });

      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Verification failed. Please check the code and try again.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google Sign-In token was not provided');
      return;
    }

    try {
      const { user: googleUser, isNewUser } = await loginWithGoogle(
        credentialResponse.credential
      );
      const isAdminOrManager =
        googleUser?.role === 'admin' || googleUser?.role === 'manager';

      toast.success(`Welcome to KiranaHub, ${googleUser.name}!`, {
        description: isNewUser
          ? 'Your account has been created via Google.'
          : isAdminOrManager
            ? 'Signed in with Administrative Access.'
            : 'Signed in with Google successfully.',
      });

      navigate(isAdminOrManager ? '/admin' : redirectPath, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Google Sign-In was unsuccessful.');
    }
  };

  return (
    <div className="min-h-[80vh] py-12 flex items-center justify-center">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-lg"
        >
          {/* Brand header */}
          <div className="text-center mb-8">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2.5 mb-3 group"
            >
              <span className="gradient-crimson flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-brand transition-transform group-hover:scale-105">
                <IconShoppingBag className="h-6 w-6" />
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-text-primary">
                Kirana<span className="text-brand-600">Hub</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {step === 1 ? 'Create your account' : 'Verify your account'}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {step === 1
                ? 'Get fresh groceries, exclusive deals, and fast local delivery.'
                : `Enter the 6-digit code sent to ${maskedTarget || 'your device'}`}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border-light bg-surface p-6 shadow-sm sm:p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                >
                  {formError && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-danger-800">
                      <svg
                        className="h-5 w-5 shrink-0 text-danger-500 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1 text-sm font-medium">{formError}</div>
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <Input
                      id="name"
                      label="Full Name"
                      type="text"
                      placeholder="Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={validationErrors.name}
                      leftIcon={<IconUser className="h-4 w-4" />}
                      autoComplete="name"
                      disabled={isSendingOtp}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="rahul@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={validationErrors.email}
                        leftIcon={<IconMail className="h-4 w-4" />}
                        autoComplete="email"
                        disabled={isSendingOtp}
                      />

                      <Input
                        id="phone"
                        label="Mobile Number"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        error={validationErrors.phone}
                        leftIcon={<IconPhone className="h-4 w-4" />}
                        autoComplete="tel"
                        disabled={isSendingOtp}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        id="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={validationErrors.password}
                        leftIcon={<IconLock className="h-4 w-4" />}
                        rightIcon={
                          showPassword ? (
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )
                        }
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        autoComplete="new-password"
                        disabled={isSendingOtp}
                      />

                      <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        error={validationErrors.confirmPassword}
                        leftIcon={<IconLock className="h-4 w-4" />}
                        autoComplete="new-password"
                        disabled={isSendingOtp}
                      />
                    </div>

                    {/* Dual Channel Choice */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Receive Verification Code Via:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleChange('channel', 'sms')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                            formData.channel === 'sms'
                              ? 'border-brand-600 bg-brand-50/50 text-brand-800 ring-2 ring-brand-500/20 shadow-sm'
                              : 'border-border-light bg-surface text-text-muted hover:border-border'
                          }`}
                        >
                          <span>📱</span>
                          <span>Mobile SMS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChange('channel', 'email')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                            formData.channel === 'email'
                              ? 'border-brand-600 bg-brand-50/50 text-brand-800 ring-2 ring-brand-500/20 shadow-sm'
                              : 'border-border-light bg-surface text-text-muted hover:border-border'
                          }`}
                        >
                          <span>✉️</span>
                          <span>Email Address</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSendingOtp}
                        disabled={isSendingOtp}
                      >
                        Continue & Verify Code
                      </Button>
                    </div>
                  </form>

                  {/* Divider: Or continue with */}
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border-light" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Or continue with
                    </span>
                    <div className="h-px flex-1 bg-border-light" />
                  </div>

                  {/* Google OAuth 2.0 Sign-In Button */}
                  <div className="flex justify-center w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google Sign-In was unsuccessful')}
                      useOneTap
                      theme="outline"
                      shape="pill"
                      text="signup_with"
                      width="100%"
                    />
                  </div>

                  <div className="mt-6 border-t border-border-light pt-5 text-center">
                    <p className="text-sm text-text-secondary">
                      Already have an account?{' '}
                      <Link
                        to={ROUTES.LOGIN}
                        className="font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 mb-3">
                      {formData.channel === 'email' ? (
                        <IconMail className="h-6 w-6" />
                      ) : (
                        <IconPhone className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Verification code sent to
                    </p>
                    <p className="text-base font-bold text-text-primary mt-0.5 font-mono">
                      {maskedTarget}
                    </p>
                  </div>

                  {/* 6-box OTP Input */}
                  <div className="py-2">
                    <OtpInput
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        if (otpError) setOtpError('');
                      }}
                      onComplete={(fullCode) => handleVerifyOtp(fullCode)}
                      error={otpError}
                      disabled={isVerifying}
                    />
                  </div>

                  {/* Reactive Countdown and Resend */}
                  <div className="text-center text-sm text-text-secondary">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp}
                        className="font-bold text-brand-600 hover:text-brand-700 hover:underline disabled:opacity-50 transition-colors"
                      >
                        {isSendingOtp ? 'Sending fresh code...' : "Didn't receive code? Resend OTP"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-text-muted">
                        <svg className="h-4 w-4 animate-spin-slow text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="30 60" />
                        </svg>
                        Resend code in <strong className="font-mono text-text-primary">{countdown}s</strong>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isVerifying}
                      disabled={isVerifying || otp.length !== 6}
                      onClick={() => handleVerifyOtp()}
                    >
                      Verify & Create Account
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setOtpError('');
                      }}
                      disabled={isVerifying}
                      className="w-full text-center text-xs font-semibold text-text-muted hover:text-text-primary py-2 transition-colors"
                    >
                      ← Edit registration details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
