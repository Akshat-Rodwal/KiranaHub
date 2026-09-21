import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../services/auth.service.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Container from '../../components/common/Container.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';
import { ROUTES } from '../../constants/index.js';
import { toast } from '../../components/common/Toast.jsx';
import {
  IconShoppingBag,
  IconLock,
  IconMail,
  IconPhone,
  IconEye,
  IconEyeOff,
  IconCheck,
} from '../../utils/icons.jsx';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard Steps: 1 = Enter Identifier, 2 = Enter OTP, 3 = Set New Password
  const [step, setStep] = useState(1);

  // Step 1 State
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState('sms'); // 'sms' | 'email'
  const [identifierError, setIdentifierError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Step 2 State
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [maskedTarget, setMaskedTarget] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Step 3 State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Reactive 60-second timer
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

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const clean = identifier.trim();

    if (!clean) {
      setIdentifierError('Please enter your registered email or phone number');
      return;
    }

    setIsSendingOtp(true);
    setIdentifierError('');

    try {
      const response = await authService.sendForgotPasswordOtp({
        identifier: clean,
        channel,
      });

      setMaskedTarget(response.maskedIdentifier);
      setCountdown(response.cooldownSeconds || 60);
      setCanResend(false);
      setOtp('');
      setOtpError('');
      setStep(2);

      toast.success(
        response.channel === 'email'
          ? 'Password reset code sent to your email!'
          : 'Password reset code sent to your mobile number!'
      );
    } catch (err) {
      const msg = err?.message || 'Failed to dispatch reset code. Please try again.';
      setIdentifierError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isSendingOtp) return;
    setIsSendingOtp(true);
    setOtpError('');

    try {
      const response = await authService.sendForgotPasswordOtp({
        identifier: identifier.trim(),
        channel,
      });

      setCountdown(response.cooldownSeconds || 60);
      setCanResend(false);
      setOtp('');
      toast.success(`A fresh verification code was sent to ${response.maskedIdentifier}!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to resend code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (submittedOtp = otp) => {
    if (!submittedOtp || submittedOtp.length !== 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const response = await authService.verifyForgotPasswordOtp({
        identifier: identifier.trim(),
        otp: submittedOtp,
      });

      setResetToken(response.resetToken);
      setStep(3);
      toast.success('Code verified! Please set your new password.');
    } catch (err) {
      const msg = err?.message || 'Invalid or expired code. Please try again.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsResetting(true);

    try {
      await authService.resetPassword({
        resetToken,
        newPassword,
      });

      toast.success('Password updated successfully!', {
        description: 'You can now sign in with your new credentials.',
      });

      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Failed to update password. Please restart the process.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-12 flex items-center justify-center">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-md"
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
              {step === 1 && 'Reset password'}
              {step === 2 && 'Enter verification code'}
              {step === 3 && 'Create new password'}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {step === 1 && 'Enter your registered email or mobile number to receive a 6-digit reset code.'}
              {step === 2 && `We sent a 6-digit code to ${maskedTarget || 'your device'}.`}
              {step === 3 && 'Choose a strong password to secure your KiranaHub account.'}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => {
              const isDone = step > s;
              const isCurrent = step === s;
              return (
                <div key={s} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-brand-600 text-white'
                        : isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-sm'
                          : 'bg-surface-subtle border border-border text-text-muted'
                    }`}
                  >
                    {isDone ? <IconCheck className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 w-8 sm:w-12 mx-1.5 rounded-full transition-colors duration-300 ${
                        step > s ? 'bg-brand-500' : 'bg-border-light'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border-light bg-surface p-6 shadow-sm sm:p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: Enter Identifier */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                >
                  {identifierError && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-danger-800">
                      <svg className="h-5 w-5 shrink-0 text-danger-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 text-sm font-medium">{identifierError}</div>
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <Input
                      id="identifier"
                      label="Email or Mobile Number"
                      type="text"
                      placeholder="name@example.com or 9876543210"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (identifierError) setIdentifierError('');
                      }}
                      leftIcon={<IconMail className="h-4 w-4" />}
                      autoComplete="username"
                      disabled={isSendingOtp}
                      autoFocus
                    />

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Send Verification Code via:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setChannel('sms')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                            channel === 'sms'
                              ? 'border-brand-600 bg-brand-50/50 text-brand-800 ring-2 ring-brand-500/20 shadow-sm'
                              : 'border-border-light bg-surface text-text-muted hover:border-border'
                          }`}
                        >
                          <span>📱</span>
                          <span>SMS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChannel('email')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                            channel === 'email'
                              ? 'border-brand-600 bg-brand-50/50 text-brand-800 ring-2 ring-brand-500/20 shadow-sm'
                              : 'border-border-light bg-surface text-text-muted hover:border-border'
                          }`}
                        >
                          <span>✉️</span>
                          <span>Email</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSendingOtp}
                        disabled={isSendingOtp || !identifier.trim()}
                      >
                        Send Reset Code
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: Enter OTP */}
              {step === 2 && (
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
                      {channel === 'email' ? <IconMail className="h-6 w-6" /> : <IconPhone className="h-6 w-6" />}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Verification code sent to
                    </p>
                    <p className="text-base font-bold text-text-primary mt-0.5 font-mono">
                      {maskedTarget}
                    </p>
                  </div>

                  <div className="py-2">
                    <OtpInput
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        if (otpError) setOtpError('');
                      }}
                      onComplete={(fullCode) => handleVerifyOtp(fullCode)}
                      error={otpError}
                      disabled={isVerifyingOtp}
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

                  <div className="space-y-3 pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isVerifyingOtp}
                      disabled={isVerifyingOtp || otp.length !== 6}
                      onClick={() => handleVerifyOtp()}
                    >
                      Verify Code
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setOtpError('');
                      }}
                      disabled={isVerifyingOtp}
                      className="w-full text-center text-xs font-semibold text-text-muted hover:text-text-primary py-2 transition-colors"
                    >
                      ← Change email or phone number
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Set New Password */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  {passwordError && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-danger-800">
                      <svg className="h-5 w-5 shrink-0 text-danger-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 text-sm font-medium">{passwordError}</div>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <Input
                      id="newPassword"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      leftIcon={<IconLock className="h-4 w-4" />}
                      rightIcon={
                        showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />
                      }
                      onRightIconClick={() => setShowPassword(!showPassword)}
                      autoComplete="new-password"
                      disabled={isResetting}
                      autoFocus
                    />

                    <Input
                      id="confirmPassword"
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      leftIcon={<IconLock className="h-4 w-4" />}
                      autoComplete="new-password"
                      disabled={isResetting}
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isResetting}
                        disabled={isResetting || !newPassword || !confirmPassword}
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 border-t border-border-light pt-5 text-center">
              <p className="text-sm text-text-secondary">
                Remember your password?{' '}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
                >
                  Back to Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
